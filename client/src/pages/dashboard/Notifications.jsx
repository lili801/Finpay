import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotificationsAndCount = async (page = 1) => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get(`/notifications?page=${page}&limit=${pagination.limit}`),
        api.get('/notifications/unread-count'),
      ]);

      setNotifications(listRes.data.data.notifications || []);
      setPagination(listRes.data.meta.pagination);
      setUnreadCount(countRes.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotificationsAndCount(1).finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotificationsAndCount(pagination.page);
    setRefreshing(false);
    toast.success('Notifications updated');
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setLoading(true);
    await fetchNotificationsAndCount(newPage);
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, status: 'READ' } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 px-2 text-xxs font-black bg-indigo-600 text-white rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Stay updated with credits, debits, and important platform status updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 h-9 text-slate-700 hover:text-brand-purple-dark hover:bg-slate-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            className="flex items-center gap-1.5 h-9"
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications List Box */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Bell className="mx-auto h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold">All quiet here</p>
            <p className="text-xs">No notifications received yet.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => notif.status !== 'READ' && handleMarkAsRead(notif._id)}
              className={`flex items-start justify-between p-5 gap-4 transition-colors cursor-pointer ${
                notif.status !== 'READ' ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    notif.status !== 'READ'
                      ? 'bg-brand-purple text-white shadow-sm'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${notif.status !== 'READ' ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                    {notif.message}
                  </p>
                  <span className="text-xxs text-slate-400 block">
                    {new Date(notif.createdAt).toLocaleDateString()} &bull;{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {notif.status !== 'READ' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif._id);
                  }}
                  className="text-xs font-semibold text-brand-purple hover:text-brand-purple-dark shrink-0 cursor-pointer"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
