import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard, Users, FolderKanban, CreditCard, MessageSquare,
  Settings, LogOut, Menu, X, FileText, Briefcase, CheckSquare, Package,
  ShoppingCart, UserPlus, Layers, PlusSquare, Ticket,
} from 'lucide-react';
import clsx from 'clsx';
import NotificationsBell from '@/components/dashboard/NotificationsBell';

// Sidebar items per role
const NAV_BY_ROLE = {
  admin: [
    { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'المستخدمون', icon: Users },
    { to: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
    { to: '/admin/leads', label: 'طلبات التسعير', icon: UserPlus },
    { to: '/admin/projects', label: 'المشاريع', icon: FolderKanban },
    { to: '/admin/payments', label: 'المدفوعات', icon: CreditCard },
    { to: '/admin/invoices', label: 'الفواتير', icon: FileText },
    { to: '/admin/packages', label: 'الباقات', icon: Package },
    { to: '/admin/addons', label: 'الإضافات', icon: PlusSquare },
    { to: '/admin/bundles', label: 'الباقات المجمّعة', icon: Layers },
    { to: '/admin/coupons', label: 'الكوبونات', icon: Ticket },
    { to: '/admin/portfolio', label: 'أعمالنا', icon: Briefcase },
    { to: '/admin/chat', label: 'المحادثات', icon: MessageSquare },
    { to: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ],
  developer: [
    { to: '/dev', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/dev/projects', label: 'مشاريعي', icon: Briefcase },
    { to: '/dev/tasks', label: 'مهامي', icon: CheckSquare },
    { to: '/dev/deliverables', label: 'التسليمات', icon: FileText },
    { to: '/dev/chat', label: 'المحادثات', icon: MessageSquare },
  ],
  user: [
    { to: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/dashboard/projects', label: 'مشاريعي', icon: Briefcase },
    { to: '/dashboard/invoices', label: 'فواتيري', icon: FileText },
    { to: '/dashboard/payments', label: 'المدفوعات', icon: CreditCard },
    { to: '/dashboard/chat', label: 'المحادثات', icon: MessageSquare },
    { to: '/dashboard/profile', label: 'حسابي', icon: Settings },
  ],
};

const ROLE_LABEL = {
  admin: 'الأدمن',
  developer: 'المطور',
  user: 'العميل',
};

const ROLE_COLOR = {
  admin: 'bg-brand-orange',
  developer: 'bg-brand-teal',
  user: 'bg-brand-purple',
};

export default function DashboardLayout({ variant }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = NAV_BY_ROLE[variant] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen bg-brand-purple-deep text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static z-40 inset-y-0 right-0 w-72 bg-brand-ink border-l-2 border-brand-orange flex flex-col',
          'transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-display font-black text-2xl">
              <span className="text-brand-orange italic">BSN</span>
            </div>
            <span className={clsx('text-[10px] font-mono px-2 py-0.5 rounded-full font-bold text-white', ROLE_COLOR[variant])}>
              {ROLE_LABEL[variant]?.toUpperCase()}
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={user?.avatar_url} alt={user?.name} className="w-11 h-11 rounded-full object-cover border-2 border-white" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{user?.name}</div>
              <div className="text-xs opacity-60 truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition',
                  isActive
                    ? 'bg-brand-orange text-white shadow-brutal-sm border-2 border-white'
                    : 'text-white/80 hover:bg-white/5 border-2 border-transparent'
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-white/5 transition text-white/80"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-brand-ink/50 backdrop-blur border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="القائمة"
            >
              <Menu size={22} />
            </button>
            <h2 className="font-display font-bold text-lg">لوحة التحكم</h2>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
