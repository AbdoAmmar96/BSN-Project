import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/dashboard/PageHeader';
import {
  User as UserIcon, Lock, Package, Users, FolderKanban,
  FileText, MessageSquare, Bell, Database, Globe,
} from 'lucide-react';

const CARDS = [
  {
    title: 'الملف الشخصي',
    desc: 'بياناتك، الصورة، والمعلومات العامة',
    icon: UserIcon,
    to: '/admin/profile',
    color: 'bg-brand-purple',
  },
  {
    title: 'كلمة المرور',
    desc: 'غيّر كلمة المرور لحسابك',
    icon: Lock,
    to: '/admin/profile',
    color: 'bg-brand-orange',
  },
  {
    title: 'الباقات والأسعار',
    desc: 'إدارة الباقات اللي بتظهر في الموقع',
    icon: Package,
    to: '/admin/packages',
    color: 'bg-brand-teal text-brand-purple-deep',
  },
  {
    title: 'المستخدمون',
    desc: 'إضافة وتعديل المستخدمين والصلاحيات',
    icon: Users,
    to: '/admin/users',
    color: 'bg-brand-purple',
  },
  {
    title: 'المشاريع',
    desc: 'إدارة كل مشاريع العملاء',
    icon: FolderKanban,
    to: '/admin/projects',
    color: 'bg-brand-orange',
  },
  {
    title: 'الفواتير',
    desc: 'إنشاء وتعديل الفواتير',
    icon: FileText,
    to: '/admin/invoices',
    color: 'bg-brand-teal text-brand-purple-deep',
  },
];

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SETTINGS"
        title="الإعدادات"
        description="إدارة حسابك وإعدادات النظام"
      />

      {/* System info card */}
      <div className="card bg-brand-purple-deep text-white border-white">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] font-mono opacity-60 mb-1">المستخدم الحالي</div>
            <div className="font-display font-black text-lg">{user?.name}</div>
            <div className="text-xs opacity-70 font-mono" dir="ltr">{user?.email}</div>
          </div>
          <div>
            <div className="text-[11px] font-mono opacity-60 mb-1">الدور</div>
            <div className="font-display font-black text-lg">أدمن</div>
            <div className="text-xs opacity-70">صلاحيات كاملة</div>
          </div>
          <div>
            <div className="text-[11px] font-mono opacity-60 mb-1">البيئة</div>
            <div className="font-display font-black text-lg">Development</div>
            <div className="text-xs opacity-70 font-mono">localhost:5173</div>
          </div>
        </div>
      </div>

      {/* Shortcuts grid */}
      <div>
        <h3 className="font-display font-black text-lg mb-3">اختصارات سريعة</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                to={c.to}
                className="card hover:-translate-y-1 transition-transform group"
              >
                <div className={`w-12 h-12 rounded-xl ${c.color} text-white border-2 border-brand-ink flex items-center justify-center mb-3 shadow-brutal-sm group-hover:rotate-3 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h4 className="font-display font-black text-base mb-1">{c.title}</h4>
                <p className="text-xs opacity-70">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <h3 className="font-display font-black text-lg mb-3">قريباً</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'إعدادات الموقع العام', desc: 'العنوان، الشعار، الـ SEO', icon: Globe },
            { title: 'بوابات الدفع', desc: 'Paymob, Fawry, Kashier', icon: Database },
            { title: 'إعدادات التنبيهات', desc: 'البريد، WhatsApp، SMS', icon: Bell },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="card opacity-60 cursor-not-allowed">
                <div className="w-12 h-12 rounded-xl bg-brand-ink/10 border-2 border-brand-ink/20 flex items-center justify-center mb-3">
                  <Icon size={22} className="text-brand-ink/50" />
                </div>
                <h4 className="font-display font-black text-base mb-1">{c.title}</h4>
                <p className="text-xs opacity-70">{c.desc}</p>
                <span className="inline-block mt-2 text-[10px] font-mono bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">
                  قريباً
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
