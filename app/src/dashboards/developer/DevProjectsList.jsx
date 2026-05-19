import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi, PROJECT_STATUS, SERVICE_TYPE } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { CardGridSkeleton } from '@/components/Skeleton';
import { Briefcase, Search, ArrowLeft } from 'lucide-react';

export default function DevProjectsList() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { search }],
    queryFn: () => projectsApi.list({ search, per_page: 30 }),
  });

  const projects = data?.data?.data || [];

  return (
    <div>
      <PageHeader
        eyebrow="DEV / PROJECTS"
        title="مشاريعك"
        description="المشاريع المسندة لك أو اللي بتشتغل عليها"
      />

      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-4 mb-5 shadow-brutal-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في مشاريعك..."
            className="w-full pr-10 py-2.5 px-4 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} cols={2} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="لسه مفيش مشاريع"
          description="هتظهر هنا لما الأدمن يسندلك مشاريع"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const s = PROJECT_STATUS[p.status];
            return (
              <Link
                key={p.id}
                to={`/dev/projects/${p.id}`}
                className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-5 shadow-brutal hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-lg transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{SERVICE_TYPE[p.service_type]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-lg truncate">{p.title}</h3>
                    <p className="text-xs opacity-60 truncate">{p.client?.name} · {p.client?.company}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge color={s?.color} size="xs">{s?.label}</Badge>
                  {p.deadline && (
                    <span className="text-xs font-mono opacity-60">
                      موعد: {new Date(p.deadline).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-70">التقدّم</span>
                    <span className="font-mono font-bold">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs opacity-60">
                  <span>{p.tasks_count || 0} مهمة · {p.deliverables_count || 0} تسليم</span>
                  <ArrowLeft size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
