import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, PROJECT_STATUS, SERVICE_TYPE } from '@/api/projects';
import { invoicesApi, INVOICE_STATUS } from '@/api/invoices';
import { onboardingApi } from '@/api/onboarding';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import Badge from '@/components/dashboard/Badge';
import { Briefcase, FileText, CreditCard, MessageSquare, Sparkles, ArrowLeft, Plus } from 'lucide-react';
import clsx from 'clsx';

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: onboardingData, isSuccess: onboardingLoaded } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => onboardingApi.show(),
    staleTime: Infinity, // one fetch per session — the result rarely changes
  });
  // Local dismissal so the modal disappears instantly and never flickers back
  // while the save/skip request is in flight.
  const [dismissed, setDismissed] = useState(false);
  const showOnboarding =
    !dismissed && onboardingLoaded && !onboardingData?.onboarding?.completed;

  const { data: projects } = useQuery({
    queryKey: ['projects', 'user'],
    queryFn: () => projectsApi.list({ per_page: 5 }),
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices', 'user'],
    queryFn: () => invoicesApi.list({ per_page: 5 }),
  });

  const projectsList = projects?.data?.data || [];
  const invoicesList = invoices?.data?.data || [];

  const totals = {
    myProjects: projects?.totals?.all || 0,
    openInvoices: invoicesList.filter(i => ['sent', 'partial', 'overdue'].includes(i.status)).length,
    totalPaid: invoicesList.reduce((sum, i) => i.status === 'paid' ? sum + Number(i.total) : sum, 0),
  };

  return (
    <div className="space-y-6">
      {showOnboarding && <OnboardingModal onDone={() => setDismissed(true)} />}

      <div className="card relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-brand-orange/10" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-brand-teal/10" />
        <div className="relative">
          <span className="eyebrow text-brand-orange">— CLIENT PORTAL</span>
          <h1 className="font-display font-black text-3xl text-brand-ink mt-2">
            أهلاً <span className="text-brand-orange">{user?.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="opacity-70 mt-1">تابع مشاريعك، فواتيرك، وتواصل معانا</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'مشاريعي', value: totals.myProjects, icon: Briefcase, color: 'bg-brand-purple' },
          { label: 'فواتير مفتوحة', value: totals.openInvoices, icon: FileText, color: 'bg-brand-orange' },
          { label: 'تم دفعه', value: `${totals.totalPaid.toLocaleString()} EGP`, icon: CreditCard, color: 'bg-brand-teal' },
          { label: 'رسائل جديدة', value: '0', icon: MessageSquare, color: 'bg-brand-ink' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border-[2.5px] border-brand-ink rounded-2xl p-5 shadow-brutal-orange hover:-translate-y-1 hover:-translate-x-1 transition">
            <div className={clsx('w-10 h-10 rounded-xl border-2 border-brand-ink text-white flex items-center justify-center mb-2', color)}>
              <Icon size={18} />
            </div>
            <div className="font-display font-black text-xl md:text-2xl text-brand-ink">{value}</div>
            <div className="text-xs font-bold text-brand-ink/70 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* New project CTA */}
      <div className="card bg-gradient-to-br from-brand-purple to-brand-purple-deep text-white border-white" style={{ boxShadow: '8px 8px 0 #F15A24' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-orange rounded-xl border-2 border-white flex items-center justify-center shadow-brutal-sm text-white">
              <Sparkles size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display font-black text-xl">جاهز تبدأ مشروع جديد؟</h3>
              <p className="text-sm opacity-90 mt-0.5">احكيلنا فكرتك وهنرجعلك في 24 ساعة</p>
            </div>
          </div>
          <Link
            to="/dashboard/projects/new"
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-white shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={16} /> مشروع جديد
          </Link>
        </div>
      </div>

      {/* Recent projects + invoices */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-xl">📂 آخر المشاريع</h3>
            <Link to="/dashboard/projects" className="text-xs font-mono text-brand-orange hover:underline">
              عرض الكل ←
            </Link>
          </div>

          {projectsList.length > 0 ? (
            <div className="space-y-2">
              {projectsList.map(p => {
                const s = PROJECT_STATUS[p.status];
                return (
                  <Link
                    key={p.id}
                    to={`/dashboard/projects/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-ink/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition"
                  >
                    <span className="text-2xl">{SERVICE_TYPE[p.service_type]?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{p.title}</div>
                      <div className="text-xs opacity-60 truncate mt-0.5">{p.progress}% مكتمل</div>
                    </div>
                    <Badge color={s?.color} size="xs">{s?.label}</Badge>
                    <ArrowLeft size={14} className="opacity-40" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 opacity-50 text-sm">لسه ما عندكش مشاريع</p>
          )}
        </div>

        <div className="card" style={{ boxShadow: '6px 6px 0 #65C8D0' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-xl">🧾 فواتيرك</h3>
            <Link to="/dashboard/invoices" className="text-xs font-mono text-brand-orange hover:underline">
              عرض الكل ←
            </Link>
          </div>

          {invoicesList.length > 0 ? (
            <div className="space-y-2">
              {invoicesList.map(inv => {
                const s = INVOICE_STATUS[inv.status];
                return (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-ink/10">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm font-mono">{inv.invoice_number}</div>
                      <div className="text-xs opacity-60 truncate">{inv.project?.title}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-display font-black text-sm">{Number(inv.total).toLocaleString()} {inv.currency}</div>
                      <Badge color={s?.color} size="xs">{s?.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 opacity-50 text-sm">لسه ما عندكش فواتير</p>
          )}
        </div>
      </div>
    </div>
  );
}
