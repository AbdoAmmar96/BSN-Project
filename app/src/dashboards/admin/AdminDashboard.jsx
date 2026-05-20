import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { overviewApi } from '@/api/invoices';
import { projectsApi, PROJECT_STATUS, SERVICE_TYPE } from '@/api/projects';
import Badge from '@/components/dashboard/Badge';
import { Skeleton } from '@/components/Skeleton';
import { Users, Briefcase, CreditCard, TrendingUp, ArrowLeft, Sparkles, ShoppingCart, UserPlus, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['admin', 'overview-stats'],
    queryFn: () => overviewApi.stats(),
  });

  const { data: recentProjects } = useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: () => projectsApi.list({ per_page: 5 }),
  });

  const cards = [
    {
      label: 'إجمالي المستخدمين',
      value: stats?.users?.total || 0,
      trend: `+${stats?.users?.new_this_month || 0} هذا الشهر`,
      icon: Users, color: 'bg-brand-purple', shadow: 'shadow-brutal-orange',
      to: '/admin/users',
    },
    {
      label: 'المشاريع النشطة',
      value: stats?.projects?.in_progress || 0,
      trend: `${stats?.projects?.completed || 0} مكتمل`,
      icon: Briefcase, color: 'bg-brand-orange', shadow: 'shadow-brutal-teal',
      to: '/admin/projects',
    },
    {
      label: 'إيرادات الشهر',
      value: `${Number(stats?.revenue?.this_month || 0).toLocaleString()} EGP`,
      trend: `إجمالي: ${Number(stats?.revenue?.total || 0).toLocaleString()} EGP`,
      icon: CreditCard, color: 'bg-brand-teal text-brand-purple-deep', shadow: 'shadow-brutal-purple',
      to: '/admin/payments',
    },
    {
      label: 'مستحقات معلقة',
      value: `${Number(stats?.revenue?.pending || 0).toLocaleString()} EGP`,
      trend: 'فواتير غير مدفوعة',
      icon: TrendingUp, color: 'bg-brand-ink', shadow: 'shadow-brutal-orange',
      to: '/admin/invoices',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow text-brand-orange">— ADMIN PANEL</span>
            <h1 className="font-display font-black text-3xl text-brand-ink mt-2">
              أهلاً <span className="text-brand-orange">{user?.name.split(' ').slice(-1)[0]}</span>
            </h1>
            <p className="opacity-70 mt-1">نظرة شاملة على كل اللي بيحصل</p>
          </div>
          <Link to="/admin/projects/new" className="btn-primary">
            <Sparkles size={16} /> مشروع جديد
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, trend, icon: Icon, color, shadow, to }) => (
          <Link
            key={label}
            to={to}
            className={clsx(
              'bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-5 block',
              shadow, 'hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-lg transition'
            )}
          >
            <div className={clsx('w-11 h-11 rounded-xl border-2 border-brand-ink text-white flex items-center justify-center mb-3', color)}>
              <Icon size={20} />
            </div>
            <div className="font-display font-black text-2xl text-brand-ink leading-tight">{value}</div>
            <div className="text-sm font-bold text-brand-ink/70 mt-1">{label}</div>
            <div className="text-xs font-mono mt-2 opacity-50">{trend}</div>
          </Link>
        ))}
      </div>

      {/* Business model row — orders & leads pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/orders" className="card flex items-center gap-4 hover:-translate-y-0.5 transition">
          <div className="w-11 h-11 rounded-xl border-2 border-brand-ink bg-brand-orange text-white flex items-center justify-center shrink-0">
            <ShoppingCart size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-display font-black text-2xl text-brand-ink leading-tight">{stats?.orders?.total ?? 0}</div>
            <div className="text-sm font-bold text-brand-ink/70">إجمالي الطلبات</div>
            <div className="text-xs font-mono mt-0.5 opacity-50">+{stats?.orders?.this_month ?? 0} هذا الشهر</div>
          </div>
        </Link>

        <Link to="/admin/orders?filter=needs_assign" className="card flex items-center gap-4 hover:-translate-y-0.5 transition">
          <div className="w-11 h-11 rounded-xl border-2 border-brand-ink bg-brand-ink text-white flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-display font-black text-2xl text-brand-orange leading-tight">{stats?.orders?.needs_assignment ?? 0}</div>
            <div className="text-sm font-bold text-brand-ink/70">محتاجين تعيين developer</div>
            <div className="text-xs font-mono mt-0.5 opacity-50">طلبات مدفوعة في الانتظار</div>
          </div>
        </Link>

        <Link to="/admin/leads" className="card flex items-center gap-4 hover:-translate-y-0.5 transition">
          <div className="w-11 h-11 rounded-xl border-2 border-brand-ink bg-brand-teal text-brand-purple-deep flex items-center justify-center shrink-0">
            <UserPlus size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-display font-black text-2xl text-brand-ink leading-tight">{stats?.leads?.open ?? 0}</div>
            <div className="text-sm font-bold text-brand-ink/70">طلبات تسعير مفتوحة</div>
            <div className="text-xs font-mono mt-0.5 opacity-50">من إجمالي {stats?.leads?.total ?? 0}</div>
          </div>
        </Link>
      </div>

      {/* Recent Projects + Role breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-xl">📋 آخر المشاريع</h3>
            <Link to="/admin/projects" className="text-xs font-mono text-brand-orange hover:underline">
              عرض الكل ←
            </Link>
          </div>

          {recentProjects?.data?.data?.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.data.data.map((p) => {
                const s = PROJECT_STATUS[p.status];
                return (
                  <Link
                    key={p.id}
                    to={`/admin/projects/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-ink/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition"
                  >
                    <span className="text-2xl">{SERVICE_TYPE[p.service_type]?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{p.title}</div>
                      <div className="text-xs opacity-60 truncate">{p.client?.name}</div>
                    </div>
                    <Badge color={s?.color} size="xs">{s?.label}</Badge>
                    <ArrowLeft size={14} className="opacity-40" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 opacity-50 text-sm">مفيش مشاريع لسه</p>
          )}
        </div>

        <div className="card" style={{ boxShadow: '6px 6px 0 #65C8D0' }}>
          <h3 className="font-display font-black text-xl mb-4">👥 توزيع الأدوار</h3>
          {stats?.users?.by_role ? (
            <div className="space-y-3">
              {[
                { key: 'admin', label: 'الأدمن', color: 'bg-brand-orange' },
                { key: 'developer', label: 'المطورون', color: 'bg-brand-teal' },
                { key: 'user', label: 'العملاء', color: 'bg-brand-purple' },
              ].map(r => {
                const total = stats.users.total || 1;
                const val = stats.users.by_role[r.key] || 0;
                const pct = (val / total) * 100;
                return (
                  <div key={r.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-bold">{r.label}</span>
                      <span className="font-mono">{val}</span>
                    </div>
                    <div className="h-2 bg-brand-ink/10 rounded-full overflow-hidden">
                      <div className={clsx('h-full transition-all', r.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Skeleton count={4} height={48} className="mb-2" />
          )}
        </div>
      </div>
    </div>
  );
}
