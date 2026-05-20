import { useOrderWizard } from '@/store/orderWizard';

const ICONS = { web: '🌐', ecommerce: '🛒', branding: '🎨', marketing: '📈' };

export default function Step1ServiceType({ labels }) {
  const { serviceType, setServiceType } = useOrderWizard();

  return (
    <div>
      <h2 className="font-display font-black text-xl text-brand-ink mb-1">اختار نوع الخدمة</h2>
      <p className="text-brand-ink/60 text-sm mb-6">إيه اللي محتاجه لمشروعك؟</p>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(labels).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setServiceType(key)}
            className={`text-right rounded-2xl border-[2.5px] p-5 transition ${
              serviceType === key
                ? 'border-brand-purple bg-brand-purple text-white shadow-[4px_4px_0_#0F0830]'
                : 'border-brand-ink/20 bg-white text-brand-ink hover:border-brand-ink'
            }`}
          >
            <div className="text-3xl mb-2">{ICONS[key]}</div>
            <div className="font-display font-black">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
