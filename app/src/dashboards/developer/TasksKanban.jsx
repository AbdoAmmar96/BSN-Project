import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tasksApi, TASK_STATUS, TASK_PRIORITY } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import Modal from '@/components/dashboard/Modal';
import { CardGridSkeleton } from '@/components/Skeleton';
import { CheckSquare, AlertCircle, Calendar, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function TasksKanban() {
  const qc = useQueryClient();
  const [editingTask, setEditingTask] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['dev', 'tasks', 'all'],
    queryFn: () => tasksApi.mine({ per_page: 100 }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dev', 'tasks'] });
      toast.success('تم التحديث');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'حصل خطأ'),
  });

  const tasks = data?.data?.data || [];
  const grouped = Object.keys(TASK_STATUS).reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  const moveTask = (task, newStatus) => {
    if (task.status === newStatus) return;
    updateMut.mutate({ id: task.id, data: { status: newStatus } });
  };

  return (
    <div>
      <PageHeader
        eyebrow="DEV / TASKS"
        title="مهامي"
        description="انقل المهام بين الأعمدة لتحديث حالتها"
      />

      {isLoading ? (
        <CardGridSkeleton count={6} cols={3} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="لسه مفيش مهام"
          description="هتظهر هنا لما الأدمن يسندلك مهام في المشاريع"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(TASK_STATUS).map(([statusKey, statusInfo]) => (
            <div key={statusKey} className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-4 shadow-brutal-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-brand-ink/10">
                <h3 className="font-display font-black text-sm">{statusInfo.label}</h3>
                <span className="text-xs font-mono font-bold bg-brand-ink/10 px-2 py-0.5 rounded-full">
                  {grouped[statusKey]?.length || 0}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {grouped[statusKey]?.map(t => {
                  const p = TASK_PRIORITY[t.priority];
                  const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setEditingTask(t)}
                      className={clsx(
                        'p-3 rounded-xl border-2 transition cursor-pointer',
                        overdue ? 'bg-red-50 border-red-300' : 'bg-brand-purple/5 border-brand-ink/10 hover:border-brand-orange/40'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={clsx('w-1 self-stretch rounded-full flex-shrink-0', p?.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{t.title}</div>
                          <Link
                            to={`/dev/projects/${t.project_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs opacity-60 hover:text-brand-orange truncate block mt-0.5"
                          >
                            <FolderKanban size={11} className="inline ms-1" /> {t.project?.title}
                          </Link>
                          {t.due_date && (
                            <div className={clsx('text-xs mt-2 flex items-center gap-1', overdue ? 'text-red-600 font-bold' : 'opacity-60')}>
                              {overdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                              {new Date(t.due_date).toLocaleDateString('ar-EG')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="تعديل المهمة"
        size="md"
      >
        {editingTask && (
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-black text-lg">{editingTask.title}</h4>
              <Link
                to={`/dev/projects/${editingTask.project_id}`}
                className="text-sm opacity-70 hover:text-brand-orange"
              >
                المشروع: {editingTask.project?.title}
              </Link>
            </div>

            {editingTask.description && (
              <div className="p-3 bg-brand-purple/5 rounded-xl text-sm opacity-90">{editingTask.description}</div>
            )}

            <div>
              <label className="label">الحالة</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TASK_STATUS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => moveTask(editingTask, k)}
                    className={clsx(
                      'px-3 py-2 rounded-xl border-2 text-sm font-bold transition',
                      editingTask.status === k
                        ? clsx(v.color, 'border-brand-ink')
                        : 'bg-white border-brand-ink/15 hover:border-brand-ink/40'
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
