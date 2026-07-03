import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Wallet, LayoutDashboard, History, Bell, ShieldAlert, ArrowLeftRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
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
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-100 bg-white shadow-xs">
      {/* Brand Title */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple text-white">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="text-lg font-extrabold text-slate-900">
          Fin<span className="text-brand-purple">Pay</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
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
                    ? 'bg-brand-purple-light text-brand-purple-dark'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}

        {/* Administrator Routes section */}
        {user?.role === 'ADMIN' && (
          <div className="pt-6 border-t border-slate-100 mt-6">
            <span className="px-4.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Admin Controls
            </span>
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4.5 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer',
                  isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
                )
              }
            >
              <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
              Admin Portal
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};
export default Sidebar;
