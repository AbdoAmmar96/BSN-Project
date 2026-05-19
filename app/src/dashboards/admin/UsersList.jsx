import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersApi, ROLE_LABELS, ROLE_COLORS } from '@/api/users';
import PageHeader from '@/components/dashboard/PageHeader';
import DataTable from '@/components/dashboard/DataTable';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { UserPlus, Edit, Trash2, Power, Search, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function UsersList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, role }],
    queryFn: () => usersApi.list({ search, role }),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => usersApi.toggleActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('تم تحديث الحالة');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'حصل خطأ'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('تم حذف المستخدم');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'حصل خطأ'),
  });

  const onDelete = (user) => {
    if (!confirm(`متأكد من حذف ${user.name}؟`)) return;
    deleteMut.mutate(user.id);
  };

  const columns = [
    {
      key: 'name', label: 'المستخدم',
      render: (u) => (
        <div className="flex items-center gap-3">
          <img src={u.avatar_url} alt={u.name} className="w-10 h-10 rounded-full border-2 border-brand-ink object-cover" />
          <div className="min-w-0">
            <div className="font-bold text-sm">{u.name}</div>
            <div className="text-xs opacity-60 truncate">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'الدور',
      render: (u) => <Badge color={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge>,
    },
    {
      key: 'company', label: 'الشركة',
      render: (u) => <span className="text-sm">{u.company || '—'}</span>,
    },
    {
      key: 'projects_count', label: 'المشاريع', align: 'center',
      render: (u) => (
        <span className="font-mono text-sm">
          {(u.projects_as_client_count || 0) + (u.projects_as_lead_count || 0)}
        </span>
      ),
    },
    {
      key: 'is_active', label: 'الحالة', align: 'center',
      render: (u) => (
        <Badge color={u.is_active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'} size="xs">
          {u.is_active ? 'نشط' : 'موقف'}
        </Badge>
      ),
    },
    {
      key: 'actions', label: 'إجراءات', align: 'center',
      render: (u) => (
        <div className="flex items-center justify-center gap-1">
          <Link
            to={`/admin/users/${u.id}`}
            className="p-2 rounded-lg hover:bg-brand-orange/10 text-brand-orange transition"
            title="تعديل"
          >
            <Edit size={16} />
          </Link>
          <button
            onClick={() => toggleMut.mutate(u.id)}
            className={clsx(
              'p-2 rounded-lg transition',
              u.is_active ? 'hover:bg-yellow-100 text-yellow-600' : 'hover:bg-green-100 text-green-600'
            )}
            title={u.is_active ? 'إيقاف' : 'تفعيل'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={() => onDelete(u)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const totals = data?.totals;
  const rows = data?.data?.data || [];

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN / USERS"
        title="إدارة المستخدمين"
        description="إنشاء، تعديل، تفعيل، أو حذف الحسابات"
        action={
          <Link to="/admin/users/new" className="btn-primary">
            <UserPlus size={16} /> مستخدم جديد
          </Link>
        }
      />

      {/* Stats */}
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          {[
            { label: 'الكل', value: totals.all, color: 'bg-white text-brand-ink' },
            { label: 'الأدمن', value: totals.admin, color: 'bg-brand-orange text-white' },
            { label: 'مطورون', value: totals.developer, color: 'bg-brand-teal text-brand-purple-deep' },
            { label: 'عملاء', value: totals.user, color: 'bg-brand-purple text-white' },
            { label: 'نشط', value: totals.active, color: 'bg-green-500 text-white' },
          ].map((s) => (
            <div key={s.label} className={clsx('rounded-xl border-[2.5px] border-brand-ink p-3 text-center shadow-brutal-sm', s.color)}>
              <div className="font-display font-black text-2xl">{s.value}</div>
              <div className="text-xs font-mono opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-4 mb-5 shadow-brutal-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، البريد، الرقم..."
            className="w-full pr-10 py-2.5 px-4 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['', 'admin', 'developer', 'user'].map((r) => (
            <button
              key={r || 'all'}
              onClick={() => setRole(r)}
              className={clsx(
                'px-3 py-2 rounded-xl border-2 text-sm font-bold transition',
                role === r ? 'bg-brand-orange text-white border-brand-ink' : 'border-brand-ink/15 hover:border-brand-ink/40'
              )}
            >
              {r ? ROLE_LABELS[r] : 'الكل'}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        empty={
          <EmptyState
            icon={UsersIcon}
            title="مفيش مستخدمين"
            description="ابدأ بإضافة أول مستخدم"
            action={
              <Link to="/admin/users/new" className="btn-primary inline-flex">
                <UserPlus size={16} /> مستخدم جديد
              </Link>
            }
          />
        }
      />
    </div>
  );
}
