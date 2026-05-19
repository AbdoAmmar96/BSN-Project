import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi, PROJECT_STATUS, SERVICE_TYPE } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { CardGridSkeleton } from '@/components/Skeleton';
import { Briefcase, Plus, ArrowLeft } from 'lucide-react';

export default function UserProjectsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects', 'user'],
    queryFn: () => projectsApi.list({ per_page: 30 }),
  });

  const projects = data?.data?.data || [];

  return (
    <div>
      <PageHeader
        eyebrow="MY PROJECTS"
        title="مشاريعي"
        action={
          <Link to="/dashboard/projects/new" className="btn-primary">
            <Plus size={16} /> مشروع جديد
          </Link>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={4} cols={2} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="ابدأ أول مشروع"
          description="احكيلنا عن فكرتك وهنبدأ معاك من أول يوم"
          action={
            <Link to="/dashboard/projects/new" className="btn-primary inline-flex">
              <Plus size={16} /> مشروع جديد
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const s = PROJECT_STATUS[p.status];
            return (
              <Link
                key={p.id}
                to={`/dashboard/projects/${p.id}`}
                className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-5 shadow-brutal hover:-translate-y-1 hover:-translate-x-1 transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{SERVICE_TYPE[p.service_type]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black truncate">{p.title}</h3>
                    <p className="text-xs opacity-60">{SERVICE_TYPE[p.service_type]?.label}</p>
                  </div>
                </div>

                <Badge color={s?.color} size="xs">{s?.label}</Badge>

                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-70">التقدّم</span>
                    <span className="font-mono font-bold">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs opacity-60">
                  <span>{p.lead_developer?.name || 'لسه ما اتسند'}</span>
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
