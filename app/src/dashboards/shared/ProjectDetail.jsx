import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { todayISO } from '@/lib/dates';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, tasksApi, deliverablesApi, PROJECT_STATUS, SERVICE_TYPE, TASK_STATUS, TASK_PRIORITY } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import Badge from '@/components/dashboard/Badge';
import Modal from '@/components/dashboard/Modal';
import { Plus, Upload, Calendar, User, Briefcase, CheckCircle, FileText, Download } from 'lucide-react';
import { Skeleton, CardSkeleton } from '@/components/Skeleton';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user, isAdmin, isDeveloper, isUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.show(id),
  });

  const project = data?.project;
  const canEdit = isAdmin || (isDeveloper && project?.lead_developer_id === user?.id);

  const statusMut = useMutation({
    mutationFn: (status) => projectsApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      toast.success('تم تحديث حالة المشروع');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'تعذّر تغيير الحالة'),
  });

  const progressMut = useMutation({
    mutationFn: (progress) => projectsApi.update(id, { progress }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      toast.success('تم تحديث نسبة الإنجاز');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'تعذّر تحديث النسبة'),
  });

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton height={28} width="40%" />
      <Skeleton height={14} width="60%" />
      <CardSkeleton lines={5} />
    </div>
  );
  if (!project) return <div className="text-center py-12">المشروع غير موجود</div>;

  const status = PROJECT_STATUS[project.status];
  const backUrl = isAdmin ? '/admin/projects' : isDeveloper ? '/dev/projects' : '/dashboard/projects';

  return (
    <div>
      <PageHeader
        eyebrow={`${SERVICE_TYPE[project.service_type]?.label || project.service_type}`}
        title={project.title}
        backTo={backUrl}
        action={<Badge color={status?.color} size="md">{status?.label}</Badge>}
      />

      {canEdit && (
        <ProjectStatusBar
          key={`${project.status}-${project.progress}`}
          current={project.status}
          progress={project.progress ?? 0}
          isAdmin={isAdmin}
          statusPending={statusMut.isPending}
          progressPending={progressMut.isPending}
          onChangeStatus={(s) => statusMut.mutate(s)}
          onChangeProgress={(p) => progressMut.mutate(p)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b-2 border-brand-ink/10 overflow-x-auto">
        {[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'tasks', label: `المهام (${project.tasks_count})` },
          { id: 'deliverables', label: `التسليمات (${project.deliverables_count})` },
          { id: 'payments', label: `المدفوعات (${project.payments_count})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-4 py-2.5 font-bold text-sm whitespace-nowrap border-b-[3px] -mb-[2px] transition',
              tab === t.id ? 'border-brand-orange text-brand-orange' : 'border-transparent opacity-60 hover:opacity-100'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab project={project} canEdit={canEdit} />}
      {tab === 'tasks' && (
        <TasksTab
          project={project}
          canEdit={canEdit}
          onNewTask={() => setNewTaskOpen(true)}
          isClient={isUser}
        />
      )}
      {tab === 'deliverables' && (
        <DeliverablesTab
          project={project}
          canUpload={canEdit}
          onUpload={() => setUploadOpen(true)}
        />
      )}
      {tab === 'payments' && <PaymentsTab project={project} />}

      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} projectId={project.id} />
      <UploadDeliverableModal open={uploadOpen} onClose={() => setUploadOpen(false)} projectId={project.id} />
    </div>
  );
}

// ============================================
// TABS
// ============================================
function OverviewTab({ project }) {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="card">
          <h3 className="font-display font-black text-lg mb-3">الوصف</h3>
          <p className="opacity-80 leading-relaxed whitespace-pre-wrap">
            {project.description || <span className="opacity-50 italic">لا يوجد وصف</span>}
          </p>
        </div>

        <div className="card">
          <h3 className="font-display font-black text-lg mb-3">التقدّم</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-70">إنجاز المشروع</span>
              <span className="font-mono font-bold">{project.progress}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-brand-ink">
              <div className="h-full bg-brand-orange transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card">
          <h3 className="font-display font-black text-base mb-3">العميل</h3>
          {project.client && (
            <div className="flex items-center gap-3">
              <img src={project.client.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-brand-ink"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${project.client.name}&background=5C15CC&color=fff`; }} />
              <div className="min-w-0">
                <div className="font-bold">{project.client.name}</div>
                <div className="text-xs opacity-60">{project.client.company || project.client.email}</div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-display font-black text-base mb-3">المطور</h3>
          {project.lead_developer ? (
            <div className="flex items-center gap-3">
              <img src={project.lead_developer.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-brand-ink"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${project.lead_developer.name}&background=65C8D0&color=0F0830`; }} />
              <div className="min-w-0">
                <div className="font-bold">{project.lead_developer.name}</div>
                <div className="text-xs opacity-60">{project.lead_developer.email}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm opacity-50 italic">غير مسند</p>
          )}
        </div>

        <div className="card grid grid-cols-2 gap-3 text-sm">
          {project.budget > 0 && (
            <div>
              <div className="text-xs opacity-60 mb-1">الميزانية</div>
              <div className="font-bold">{Number(project.budget).toLocaleString()} {project.currency}</div>
            </div>
          )}
          {project.paid_amount > 0 && (
            <div>
              <div className="text-xs opacity-60 mb-1">مدفوع</div>
              <div className="font-bold text-brand-teal">{Number(project.paid_amount).toLocaleString()}</div>
            </div>
          )}
          {project.start_date && (
            <div>
              <div className="text-xs opacity-60 mb-1">البداية</div>
              <div className="font-mono text-xs">{new Date(project.start_date).toLocaleDateString('ar-EG')}</div>
            </div>
          )}
          {project.deadline && (
            <div>
              <div className="text-xs opacity-60 mb-1">التسليم</div>
              <div className={clsx('font-mono text-xs', project.is_overdue && 'text-red-600 font-bold')}>
                {new Date(project.deadline).toLocaleDateString('ar-EG')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ project, canEdit, onNewTask, isClient }) {
  const qc = useQueryClient();
  const tasksByStatus = (project.tasks || []).reduce((acc, t) => {
    (acc[t.status] = acc[t.status] || []).push(t);
    return acc;
  }, {});

  const moveMut = useMutation({
    mutationFn: ({ id, status }) => tasksApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', String(project.id)] });
      toast.success('تم تحديث المهمة');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'تعذّر التحديث'),
  });

  // The lifecycle order, used to offer "back"/"forward" moves per task.
  const FLOW = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-black text-xl">قائمة المهام</h3>
        {canEdit && (
          <button onClick={onNewTask} className="btn-primary text-sm">
            <Plus size={14} /> مهمة جديدة
          </button>
        )}
      </div>

      {!project.tasks?.length ? (
        <div className="card text-center py-10 opacity-60">
          <CheckCircle className="mx-auto mb-2" size={32} />
          <p>مفيش مهام لسه</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(TASK_STATUS).map(([k, v]) => (
            <div key={k} className="card p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-brand-ink/10">
                <h4 className="font-bold text-sm">{v.label}</h4>
                <span className="text-xs font-mono opacity-60">{tasksByStatus[k]?.length || 0}</span>
              </div>
              <div className="space-y-2">
                {tasksByStatus[k]?.map(t => {
                  const p = TASK_PRIORITY[t.priority];
                  const idx = FLOW.indexOf(t.status);
                  const prev = idx > 0 ? FLOW[idx - 1] : null;
                  const next = idx < FLOW.length - 1 ? FLOW[idx + 1] : null;
                  return (
                    <div key={t.id} className="p-3 rounded-xl bg-brand-purple/5 border border-brand-ink/10">
                      <div className="flex items-start gap-2">
                        <span className={clsx('w-1 self-stretch rounded-full', p?.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm">{t.title}</div>
                          {t.assignee && (
                            <div className="text-xs opacity-60 mt-1">@ {t.assignee.name}</div>
                          )}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-brand-ink/10">
                          {prev && (
                            <button
                              onClick={() => moveMut.mutate({ id: t.id, status: prev })}
                              disabled={moveMut.isPending}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg border border-brand-ink/20 hover:border-brand-ink/50 disabled:opacity-40"
                            >
                              → {TASK_STATUS[prev].label}
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => moveMut.mutate({ id: t.id, status: next })}
                              disabled={moveMut.isPending}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-brand-orange text-white border border-brand-ink hover:-translate-y-0.5 transition disabled:opacity-40"
                            >
                              {TASK_STATUS[next].label} ←
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeliverablesTab({ project, canUpload, onUpload }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-black text-xl">الملفات والتسليمات</h3>
        {canUpload && (
          <button onClick={onUpload} className="btn-primary text-sm">
            <Upload size={14} /> ارفع ملف
          </button>
        )}
      </div>

      {!project.deliverables?.length ? (
        <div className="card text-center py-10 opacity-60">
          <FileText className="mx-auto mb-2" size={32} />
          <p>مفيش تسليمات لسه</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.deliverables.map(d => (
            <div key={d.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-orange text-white border-2 border-brand-ink flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{d.title}</div>
                  <div className="text-xs opacity-60 font-mono mt-0.5">{d.size_human}</div>
                  {d.is_final && (
                    <Badge color="bg-green-500 text-white" size="xs" >تسليم نهائي</Badge>
                  )}
                </div>
                <a href={d.file_url} target="_blank" rel="noreferrer" className="text-brand-orange hover:opacity-70">
                  <Download size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ project }) {
  if (!project.payments?.length) {
    return (
      <div className="card text-center py-10 opacity-60">
        <p>مفيش مدفوعات لسه</p>
      </div>
    );
  }
  return (
    <div className="card">
      <h3 className="font-display font-black text-xl mb-4">المدفوعات</h3>
      <div className="space-y-2">
        {project.payments.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-purple/5 border border-brand-ink/10">
            <div className="min-w-0">
              <div className="font-bold text-sm">{p.reference}</div>
              <div className="text-xs opacity-60 mt-0.5">
                {p.gateway} · {new Date(p.created_at).toLocaleDateString('ar-EG')}
              </div>
            </div>
            <div className="text-left">
              <div className="font-display font-black text-lg">{Number(p.amount).toLocaleString()} {p.currency}</div>
              <Badge color={p.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-200 text-yellow-800'} size="xs">
                {p.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MODALS
// ============================================
function NewTaskModal({ open, onClose, projectId }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [dueDate, setDueDate] = useState('');

  const mut = useMutation({
    mutationFn: () => tasksApi.create(projectId, { title, description, priority, due_date: dueDate || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', String(projectId)] });
      toast.success('تم إنشاء المهمة');
      onClose();
      setTitle(''); setDescription(''); setPriority('normal'); setDueDate('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  return (
    <Modal open={open} onClose={onClose} title="مهمة جديدة" size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">إلغاء</button>
          <button onClick={() => mut.mutate()} disabled={!title || mut.isPending} className="btn-primary text-sm disabled:opacity-60">
            إنشاء
          </button>
        </div>
      }>
      <div className="space-y-4">
        <div>
          <label className="label">العنوان *</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">الوصف</label>
          <textarea className="field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">الأولوية</label>
            <select className="field" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">منخفضة</option>
              <option value="normal">عادية</option>
              <option value="high">عالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>
          <div>
            <label className="label">موعد التسليم</label>
            <input type="date" className="field text-left" dir="ltr" min={todayISO()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function UploadDeliverableModal({ open, onClose, projectId }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isFinal, setIsFinal] = useState(false);

  const mut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('file', file);
      fd.append('is_final', isFinal ? '1' : '0');
      return deliverablesApi.upload(projectId, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', String(projectId)] });
      toast.success('تم رفع الملف');
      onClose();
      setTitle(''); setDescription(''); setFile(null); setIsFinal(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  return (
    <Modal open={open} onClose={onClose} title="رفع تسليم" size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">إلغاء</button>
          <button onClick={() => mut.mutate()} disabled={!file || !title || mut.isPending} className="btn-primary text-sm disabled:opacity-60">
            رفع
          </button>
        </div>
      }>
      <div className="space-y-4">
        <div>
          <label className="label">العنوان *</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">الوصف</label>
          <textarea className="field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="label">الملف *</label>
          <input type="file" className="field" onChange={(e) => setFile(e.target.files[0])} />
          {file && <p className="text-xs opacity-60 mt-1 font-mono">{file.name} · {Math.round(file.size / 1024)} KB</p>}
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 accent-brand-orange" checked={isFinal} onChange={(e) => setIsFinal(e.target.checked)} />
          <span className="font-bold text-sm">تسليم نهائي</span>
        </label>
      </div>
    </Modal>
  );
}

// Developers drive the project lifecycle; admins can pick any state.
const DEV_FLOW = ['in_progress', 'review', 'revision', 'completed'];
const ADMIN_FLOW = ['pending_assignment', 'in_progress', 'review', 'revision', 'completed', 'on_hold', 'cancelled'];

function ProjectStatusBar({ current, progress, isAdmin, statusPending, progressPending, onChangeStatus, onChangeProgress }) {
  const states = isAdmin ? ADMIN_FLOW : DEV_FLOW;
  const [pct, setPct] = useState(progress);
  const dirty = pct !== progress;

  return (
    <div className="rounded-2xl border-2 border-brand-ink/15 bg-white p-4 mb-5 space-y-4">
      {/* Lifecycle */}
      <div>
        <div className="text-xs font-bold text-brand-ink/60 mb-2">حالة المشروع</div>
        <div className="flex flex-wrap gap-2">
          {states.map((s) => {
            const info = PROJECT_STATUS[s];
            const active = current === s;
            return (
              <button
                key={s}
                type="button"
                disabled={statusPending || active}
                onClick={() => onChangeStatus(s)}
                className={clsx(
                  'px-3.5 py-2 rounded-xl border-2 text-sm font-bold transition disabled:cursor-default',
                  active
                    ? clsx(info?.color, 'border-brand-ink')
                    : 'bg-white text-brand-ink border-brand-ink/15 hover:border-brand-ink/50'
                )}
              >
                {info?.label || s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-brand-ink/60">نسبة الإنجاز</span>
          <span className="font-display font-black text-brand-orange">{pct}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full accent-brand-orange"
        />
        {dirty && (
          <button
            type="button"
            disabled={progressPending}
            onClick={() => onChangeProgress(pct)}
            className="mt-2 px-4 py-1.5 rounded-xl bg-brand-purple text-white font-bold text-sm disabled:opacity-50"
          >
            {progressPending ? 'جاري الحفظ...' : 'حفظ النسبة'}
          </button>
        )}
      </div>
    </div>
  );
}
