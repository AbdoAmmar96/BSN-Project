import { useState } from 'react';
import { CreditCard, Smartphone, Calendar, Receipt, Check, FlaskConical } from 'lucide-react';
import clsx from 'clsx';

const GATEWAYS = [
  {
    id: 'paymob_card',
    label: 'بطاقة ائتمان',
    desc: 'Visa · Mastercard · Meeza',
    icon: CreditCard,
    color: 'bg-brand-purple',
    badges: ['آمن', 'فوري'],
  },
  {
    id: 'paymob_wallet',
    label: 'محفظة موبايل',
    desc: 'فودافون كاش · إتصالات · أورنج · WE',
    icon: Smartphone,
    color: 'bg-brand-teal text-brand-purple-deep',
    badges: ['فوري'],
    requiresPhone: true,
  },
  {
    id: 'fawry',
    label: 'فوري',
    desc: 'ادفع في أي منفذ فوري قريب منك',
    icon: Receipt,
    color: 'bg-brand-orange',
    badges: ['كاش', 'بدون بطاقة'],
  },
  {
    id: 'paymob_installments',
    label: 'تقسيط',
    desc: 'Souhoola · ValU · أمان · فُرصة',
    icon: Calendar,
    color: 'bg-brand-ink',
    badges: ['+20K جنيه', '3-24 شهر'],
    minAmount: 20000,
  },
  {
    id: 'kashier',
    label: 'Kashier',
    desc: 'بطاقات عبر Kashier',
    icon: CreditCard,
    color: 'bg-brand-purple-deep',
    badges: ['آمن'],
  },
  // Dev-only: simulate a successful payment instantly (real gateways pending).
  ...(import.meta.env.DEV
    ? [{
        id: 'mock',
        label: 'دفع تجريبي (Mock)',
        desc: 'محاكاة دفع ناجح فوراً — للتطوير فقط',
        icon: FlaskConical,
        color: 'bg-green-600',
        badges: ['تجريبي', 'فوري'],
      }]
    : []),
];

export default function GatewaySelector({ amount, selected, onSelect, phone, onPhoneChange, months, onMonthsChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label">طريقة الدفع</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GATEWAYS.map((g) => {
            const disabled = g.minAmount && amount < g.minAmount;
            const isSelected = selected === g.id;
            return (
              <button
                key={g.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(g.id)}
                className={clsx(
                  'relative text-right p-4 rounded-2xl border-[2.5px] transition disabled:opacity-40 disabled:cursor-not-allowed',
                  isSelected
                    ? 'border-brand-ink shadow-brutal-sm bg-brand-orange/10'
                    : 'border-brand-ink/15 hover:border-brand-ink/40'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand-orange text-white border-2 border-brand-ink flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={clsx('w-11 h-11 rounded-xl border-2 border-brand-ink flex items-center justify-center text-white flex-shrink-0', g.color)}>
                    <g.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0" style={{ wordBreak: 'break-word' }}>
                    <div className="font-display font-black text-base leading-tight">{g.label}</div>
                    <div className="text-xs opacity-70 mt-1 leading-snug">{g.desc}</div>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {g.badges.map(b => (
                        <span key={b} className="px-2 py-0.5 text-[10px] font-mono font-bold bg-brand-ink/5 rounded-full whitespace-nowrap">
                          {b}
                        </span>
                      ))}
                    </div>
                    {disabled && (
                      <div className="text-xs text-red-600 font-bold mt-2">
                        الحد الأدنى: {g.minAmount.toLocaleString()} EGP
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone field for wallet */}
      {selected === 'paymob_wallet' && (
        <div className="bg-brand-teal/10 border-2 border-brand-teal/30 rounded-xl p-4">
          <label className="label">رقم المحفظة *</label>
          <input
            type="tel"
            className="field text-left"
            dir="ltr"
            placeholder="01000000000"
            value={phone || ''}
            onChange={(e) => onPhoneChange(e.target.value)}
          />
          <p className="text-xs opacity-70 mt-1">هتستلم تأكيد على الموبايل لتأكيد الدفع</p>
        </div>
      )}

      {/* Months for installments */}
      {selected === 'paymob_installments' && (
        <div className="bg-brand-ink/5 border-2 border-brand-ink/15 rounded-xl p-4">
          <label className="label">عدد الشهور *</label>
          <select
            className="field"
            value={months || 6}
            onChange={(e) => onMonthsChange(Number(e.target.value))}
          >
            {[3, 6, 9, 12, 18, 24].map(m => (
              <option key={m} value={m}>{m} شهور · ~{Math.round(amount / m).toLocaleString()} EGP/شهر</option>
            ))}
          </select>
          <p className="text-xs opacity-70 mt-1">الموافقة على التقسيط بتتم من مزوّد الخدمة</p>
        </div>
      )}
    </div>
  );
}

export { GATEWAYS };
