import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { packagesApi, SERVICE_TYPE_LABELS } from '@/api/packages';
import { ordersApi, addonsApi } from '@/api/orders';
import { validateProjectTitle, validateProjectDescription } from '@/lib/validators';
import { useOrderWizard } from '@/store/orderWizard';
import WizardLayout from './WizardLayout';
import Step1ServiceType from './Step1ServiceType';
import Step2SelectPackage from './Step2SelectPackage';
import Step3Addons from './Step3Addons';
import Step4ProjectDetails from './Step4ProjectDetails';
import Step5Review from './Step5Review';

export default function OrderWizard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const w = useOrderWizard();
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef(null);

  // Preselected package coming from the public detail page (?package=ID).
  const preselectId = searchParams.get('package');
  const { data: preselectData } = useQuery({
    queryKey: ['package', preselectId],
    queryFn: () => packagesApi.show(preselectId),
    enabled: !!preselectId,
  });

  useEffect(() => {
    const pkg = preselectData?.package;
    if (!pkg) return;
    // Only apply when it's actually a different package than the current draft.
    if (w.packageId !== pkg.id) {
      w.preselectPackage(pkg.service_type, pkg.id);
    }
    // Clear the query param so refresh/back doesn't re-trigger or overwrite edits.
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectData]);

  // Catalog data
  const { data: pkgData } = useQuery({
    queryKey: ['packages', w.serviceType],
    queryFn: () => packagesApi.publicList(w.serviceType),
    enabled: !!w.serviceType,
  });
  const { data: addonData } = useQuery({
    queryKey: ['addons', w.serviceType],
    queryFn: () => addonsApi.list(w.serviceType),
    enabled: !!w.serviceType,
  });
  const packages = pkgData?.data ?? [];
  const addons = addonData?.data ?? [];

  // Live pricing — debounced 300ms whenever the cart changes.
  useEffect(() => {
    if (!w.packageId) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const b = await ordersApi.calculate({
          package_id: w.packageId,
          addon_ids: w.addonIds,
          currency: w.currency,
          coupon_code: w.couponCode || undefined,
        });
        w.setPricing(b);
      } catch {
        /* ignore transient pricing errors */
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.packageId, w.addonIds, w.currency, w.couponCode]);

  // Persist a draft order server-side at the details step.
  const saveDraft = async () => {
    const payload = {
      package_id: w.packageId,
      addon_ids: w.addonIds,
      currency: w.currency,
      coupon_code: w.couponCode || undefined,
      project_name: w.projectName,
      description: w.description,
      expected_launch_date: w.expectedLaunchDate || undefined,
    };
    if (w.orderId) {
      const { coupon_error } = await ordersApi.update(w.orderId, payload);
      if (coupon_error) toast.error(coupon_error);
      return w.orderId;
    }
    const { order, coupon_error } = await ordersApi.create(payload);
    if (coupon_error) toast.error(coupon_error);
    w.setOrderId(order.id);
    return order.id;
  };

  const goCheckout = async () => {
    const nameErr = validateProjectTitle(w.projectName);
    const descErr = w.description?.trim() ? validateProjectDescription(w.description) : null;
    if (nameErr || descErr) {
      toast.error(nameErr || descErr);
      w.setStep(4);
      return;
    }
    setBusy(true);
    try {
      const orderId = await saveDraft();
      await ordersApi.checkout(orderId);
      const reset = w.reset;
      navigate(`/dashboard/orders/${orderId}?checkout=1`);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حصل خطأ، حاول تاني');
    } finally {
      setBusy(false);
    }
  };

  const canNext = {
    1: !!w.serviceType,
    2: !!w.packageId,
    3: true,
    4: !!w.projectName.trim(),
  }[w.step];

  const renderStep = () => {
    switch (w.step) {
      case 1: return <Step1ServiceType labels={SERVICE_TYPE_LABELS} />;
      case 2: return <Step2SelectPackage packages={packages} />;
      case 3: return <Step3Addons addons={addons} />;
      case 4: return <Step4ProjectDetails />;
      case 5: return <Step5Review packages={packages} addons={addons} labels={SERVICE_TYPE_LABELS} />;
      default: return null;
    }
  };

  const footer = (
    <>
      {w.step > 1 && (
        <button
          type="button"
          onClick={w.back}
          className="px-4 py-2 rounded-xl border-2 border-brand-ink font-bold text-brand-ink bg-white hover:bg-brand-ink/5 transition"
        >
          <ArrowRight size={16} className="inline" /> رجوع
        </button>
      )}
      {w.step < 5 ? (
        <button
          type="button"
          disabled={!canNext}
          onClick={async () => {
            if (w.step === 4) {
              setBusy(true);
              try { await saveDraft(); } catch (e) { toast.error('تعذّر الحفظ'); }
              setBusy(false);
            }
            w.next();
          }}
          className="px-5 py-2 rounded-xl bg-brand-purple text-white font-bold disabled:opacity-40 hover:bg-brand-purple/90 transition"
        >
          التالي <ArrowLeft size={16} className="inline" />
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={goCheckout}
          className="px-5 py-2 rounded-xl bg-brand-orange text-white font-black disabled:opacity-50 hover:bg-brand-orange/90 transition"
        >
          {busy ? 'لحظة...' : 'ادفع وابدأ المشروع'}
        </button>
      )}
    </>
  );

  return <WizardLayout footer={footer}>{renderStep()}</WizardLayout>;
}
