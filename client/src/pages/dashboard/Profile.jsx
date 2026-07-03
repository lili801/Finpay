import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, ShieldAlert, Calendar, LogOut, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out!');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto text-left pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Review your personal security details and credentials.</p>
      </div>

      {/* Profile Details Card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Banner area */}
        <div className="h-32 bg-brand-purple-light flex items-end px-6 pb-4">
          <div className="h-16 w-16 rounded-full bg-brand-purple border-4 border-white flex items-center justify-center text-white shadow-md">
            <User className="h-8 w-8" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </h2>
            <span className="text-sm font-semibold text-brand-purple font-mono">@{user?.username}</span>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4 text-sm">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="h-4.5 w-4.5 text-slate-400" />
              <div className="flex-1">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-slate-700 font-semibold">{user?.email}</span>
              </div>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 text-xxs font-bold border border-emerald-100">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 text-xxs font-bold border border-amber-100">
                  Pending
                </span>
              )}
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Access Role</span>
                <span className="text-slate-700 font-semibold uppercase">{user?.role || 'USER'}</span>
              </div>
            </div>

            {/* Member Since */}
            {user?.createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Account Created</span>
                  <span className="text-slate-700 font-semibold">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
