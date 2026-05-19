import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi, PROJECT_STATUS, SERVICE_TYPE } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import DataTable from '@/components/dashboard/DataTable';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { Plus, Edit, Trash2, Search, FolderKanban, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ProjectsList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { search, status }],
    queryFn: () => projectsApi.list({ search, status }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('تم الحذف');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  const onDelete = (p) => {
    if (!confirm(`حذف "${p.title}" — متأكد؟`)) return;
    deleteMut.mutate(p.id);
  };

  const columns = [
    {
      key: 'title', label: 'المشروع',
      render: (p) => (
        <div className="min-w-0">
          <div className="font-bold flex items-center gap-2">
            <span className="text-xl">{SERVICE_TYPE[p.service_type]?.icon}</span>
            <span>{p.title}</span>
          </div>
          <div className="text-xs opacity-60 font-mono truncate mt-0.5">{p.slug}</div>
        </div>
      ),
    },
    {
      key: 'client', label: 'العميل',
      render: (p) => (
        <div className="flex items-center gap-2 min-w-0">
          <img src={p.client?.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-brand-ink object-cover"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${p.client?.name}&background=5C15CC&color=fff`; }} />
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{p.client?.name}</div>
            <div className="text-xs opacity-60 truncate">{p.client?.company || p.client?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'lead_developer', label: 'المطور',
      render: (p) => p.lead_developer
        ? <span className="text-sm font-bold">{p.lead_developer.name}</span>
        : <span className="text-xs opacity-50">— غير مسند —</span>,
    },
    {
      key: 'status', label: 'الحالة',
      render: (p) => {
        const s = PROJECT_STATUS[p.status] || PROJECT_STATUS.draft;
        return <Badge color={s.color}>{s.label}</Badge>;
      },
    },
    {
      key: 'budget', label: 'الميزانية', align: 'center',
      render: (p) => p.budget > 0
        ? <span className="font-mono text-sm font-bold">{Number(p.budget).toLocaleString()} {p.currency}</span>
        : <span className="text-xs opacity-50">—</span>,
    },
    {
      key: 'progress', label: 'التقدّم', align: 'center',
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
            <div className="h-full bg-brand-orange transition-all" style={{ width: `${p.progress}%` }} />
          </div>
          <span className="text-xs font-mono">{p.progress}%</span>
        </div>
      ),
    },
    {
      key: 'actions', label: '', align: 'center',
      render: (p) => (
        <div className="flex items-center justify-center gap-1">
          <Link to={`/admin/projects/${p.id}`} className="p-2 rounded-lg hover:bg-brand-orange/10 text-brand-orange transition" title="تعديل">
            <Edit size={16} />
          </Link>
          <button onClick={() => onDelete(p)} className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition" title="حذف">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const totals = data?.totals;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN / PROJECTS"
        title="إدارة المشاريع"
        action={
          <Link to="/admin/projects/new" className="btn-primary">
            <Plus size={16} /> مشروع جديد
          </Link>
        }
      />

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'الكل', value: totals.all, color: 'bg-white text-brand-ink' },
            { label: 'قيد التنفيذ', value: totals.in_progress, color: 'bg-brand-orange text-white' },
            { label: 'في الانتظار', value: totals.pending, color: 'bg-yellow-300 text-yellow-900' },
            { label: 'مكتمل', value: totals.completed, color: 'bg-green-500 text-white' },
          ].map((s) => (
            <div key={s.label} className={clsx('rounded-xl border-[2.5px] border-brand-ink p-3 text-center shadow-brutal-sm', s.color)}>
              <div className="font-display font-black text-2xl">{s.value}</div>
              <div className="text-xs font-mono opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-4 mb-5 shadow-brutal-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المشاريع..."
            className="w-full pr-10 py-2.5 px-4 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="py-2.5 px-4 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm font-bold"
        >
          <option value="">كل الحالات</option>
          {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data?.data || []}
        loading={isLoading}
        empty={
          <EmptyState
            icon={FolderKanban}
            title="مفيش مشاريع"
            description="ابدأ بإنشاء أول مشروع"
            action={<Link to="/admin/projects/new" className="btn-primary inline-flex"><Plus size={16} /> مشروع جديد</Link>}
          />
        }
      />
    </div>
  );
}
