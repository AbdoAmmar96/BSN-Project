import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, tasksApi, PROJECT_STATUS, TASK_STATUS, TASK_PRIORITY, SERVICE_TYPE } from '@/api/projects';
import Badge from '@/components/dashboard/Badge';
import { Briefcase, CheckSquare, Clock, FileText, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export default function DeveloperDashboard() {
  const { user } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list({ per_page: 50 }),
  });

  const { data: myTasks } = useQuery({
    queryKey: ['dev', 'tasks', 'all'],
    queryFn: () => tasksApi.mine({ per_page: 50 }),
  });

  const tasks = myTasks?.data?.data || [];
  const stats = {
    active: projects?.totals?.in_progress || 0,
    open: tasks.filter(t => t.status !== 'done').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <div className="card" style={{ boxShadow: '6px 6px 0 #65C8D0' }}>
        <span className="eyebrow text-brand-teal">— DEVELOPER PANEL</span>
        <h1 className="font-display font-black text-3xl text-brand-ink mt-2">
          أهلاً <span className="text-brand-teal-deep">{user?.name.split(' ')[0]}</span>
        </h1>
        <p className="opacity-70 mt-1">مشاريعك، مهامك، وتسليماتك — كل اللي محتاجه في مكان واحد</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'مشاريع نشطة', value: stats.active, icon: Briefcase, color: 'bg-brand-teal' },
          { label: 'مهام مفتوحة', value: stats.open, icon: CheckSquare, color: 'bg-brand-orange' },
          { label: 'مراجعة', value: stats.review, icon: Clock, color: 'bg-brand-purple' },
          { label: 'تم تسليمها', value: stats.done, icon: FileText, color: 'bg-brand-ink' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border-[2.5px] border-brand-ink rounded-2xl p-5 shadow-brutal-teal hover:-translate-y-1 hover:-translate-x-1 transition">
            <div className={clsx('w-10 h-10 rounded-xl border-2 border-brand-ink text-white flex items-center justify-center mb-2', color)}>
              <Icon size={18} />
            </div>
            <div className="font-display font-black text-2xl text-brand-ink">{value}</div>
            <div className="text-xs font-bold text-brand-ink/70 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* My tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-xl">📌 مهامي</h3>
          <Link to="/dev/tasks" className="text-xs font-mono text-brand-orange hover:underline">
            عرض الكل ←
          </Link>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.slice(0, 6).map(t => {
              const s = TASK_STATUS[t.status];
              const p = TASK_PRIORITY[t.priority];
              return (
                <Link
                  key={t.id}
                  to={`/dev/projects/${t.project_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-brand-ink/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition"
                >
                  <span className={clsx('w-2 h-10 rounded-full flex-shrink-0', p?.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-brand-ink">{t.title}</div>
                    <div className="text-xs opacity-60 truncate">{t.project?.title}</div>
                  </div>
                  <Badge color={s?.color} size="xs">{s?.label}</Badge>
                  <ArrowLeft size={14} className="opacity-40" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 opacity-50">
            <CheckSquare className="mx-auto mb-2 text-brand-orange" size={32} />
            <p className="text-sm">لسه ما عندكش مهام مسندة</p>
          </div>
        )}
      </div>

      {/* My projects */}
      <div className="card" style={{ boxShadow: '6px 6px 0 #5C15CC' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-xl">📂 مشاريعك</h3>
          <Link to="/dev/projects" className="text-xs font-mono text-brand-orange hover:underline">
            عرض الكل ←
          </Link>
        </div>

        {projects?.data?.data?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.data.data.slice(0, 4).map(p => {
              const s = PROJECT_STATUS[p.status];
              return (
                <Link
                  key={p.id}
                  to={`/dev/projects/${p.id}`}
                  className="p-4 rounded-xl border-2 border-brand-ink/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{SERVICE_TYPE[p.service_type]?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate text-brand-ink">{p.title}</div>
                      <div className="text-xs opacity-60 truncate">{p.client?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge color={s?.color} size="xs">{s?.label}</Badge>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden w-16">
                        <div className="h-full bg-brand-orange" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs font-mono">{p.progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-6 opacity-50 text-sm">لسه مفيش مشاريع</p>
        )}
      </div>
    </div>
  );
}
