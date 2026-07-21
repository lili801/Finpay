import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Wallet, LayoutDashboard, History, Bell, ShieldAlert, ArrowLeftRight, User, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const userNavItems = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/dashboard/wallet',
      label: 'Wallet Ops',
      icon: ArrowLeftRight,
    },
    {
      to: '/dashboard/transactions',
      label: 'Transactions',
      icon: History,
    },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/dashboard/profile',
      label: 'My Profile',
      icon: User,
    },
  ];

  const adminNavItems = [
    {
      to: '/dashboard/admin',
      label: 'Admin Control Center',
      icon: ShieldAlert,
      end: true,
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-100 bg-white shadow-xs">
      {/* Brand Title */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${isAdmin ? 'bg-red-600' : 'bg-brand-purple'}`}>
            {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
          </div>
          <span className="text-lg font-extrabold text-slate-900">
            Fin<span className={isAdmin ? 'text-red-600' : 'text-brand-purple'}>Pay</span>
          </span>
        </div>
        {isAdmin && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
            Admin
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {isAdmin && (
          <div className="px-4.5 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admin Workspace
            </span>
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4.5 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer',
                  isActive
                    ? isAdmin
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'bg-brand-purple-light text-brand-purple-dark font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
                )
              }
            >
              <Icon className={cn('h-4.5 w-4.5', isAdmin && 'text-red-600')} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
export default Sidebar;
