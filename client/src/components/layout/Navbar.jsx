import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Bell, LogOut, User, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-6 shadow-xs">
      {/* Brand logo / title */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-slate-800 md:hidden">
          FinPay {isAdmin ? 'Admin' : ''}
        </span>
      </div>

      {/* Right-aligned section */}
      <div className="flex items-center gap-4">
        {!isAdmin && (
          <Link
            to="/dashboard/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-indigo-600"></span>
          </Link>
        )}

        {/* User profile info */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-bold text-slate-800">
                  {user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
                </span>
                <span className="flex items-center gap-1 text-xxs font-bold uppercase tracking-wider text-red-600">
                  System Admin
                </span>
              </div>
            </div>
          ) : (
            <Link to="/dashboard/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </span>
                <span className="flex items-center gap-1 text-xxs font-bold uppercase tracking-wider text-slate-400">
                  User
                </span>
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-10 w-10 p-0 text-slate-500 hover:text-red-600 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
