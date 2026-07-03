import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Bell,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';

export const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [walletRes, balanceRes, txRes, notifRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/balance'),
        api.get('/wallet/transactions?page=1&limit=50'),
        api.get('/notifications?page=1&limit=5'),
      ]);

      setWallet(walletRes.data.data.wallet);
      setBalance(balanceRes.data.data.balance);
      setTransactions(txRes.data.data.transactions || []);
      setNotifications(notifRes.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data. Please try again.');
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const walletId = wallet?._id || wallet?.id;
  const succeededTx = transactions.filter((t) => t.status === 'SUCCESS' || t.status === 'SUCCEEDED');

  const moneyAdded = succeededTx
    .filter((t) => t.type === 'TOP_UP' || t.type === 'ADD_MONEY')
    .reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

  const moneySent = succeededTx
    .filter((t) => t.type === 'TRANSFER' && t.senderWalletId === walletId)
    .reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

  const moneyReceived = succeededTx
    .filter((t) => t.type === 'TRANSFER' && t.receiverWalletId === walletId)
    .reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

  // Chart Data: Group last 7 days of transactions
  const getChartData = () => {
    const dailyData = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[dateString] = { date: dateString, Sent: 0, Received: 0, Added: 0 };
      last7Days.push(dateString);
    }

    succeededTx.forEach((tx) => {
      const txDate = new Date(tx.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (dailyData[txDate]) {
        const amount = (tx.amount || 0) / 100;
        if (tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY') {
          dailyData[txDate].Added += amount;
        } else if (tx.type === 'TRANSFER') {
          if (tx.senderWalletId === walletId) {
            dailyData[txDate].Sent += amount;
          } else {
            dailyData[txDate].Received += amount;
          }
        }
      }
    });

    return last7Days.map((day) => dailyData[day]);
  };

  const chartData = getChartData();
  const balanceInRupees = balance ? (balance.balance / 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 pb-12">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          isLoading={refreshing}
          className="flex items-center gap-1.5 h-9"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Grid: Welcome, Balance & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Welcome Card & Balance */}
        <div className="col-span-12 md:col-span-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2 text-left">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-slate-500 text-sm">
              Keep track of your digital wallet, make instant transfers, and review your statements.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-6 gap-6">
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <div className="flex items-baseline gap-1 text-slate-900">
                <span className="text-3xl font-black">₹{balanceInRupees}</span>
                <span className="text-xs font-bold text-slate-500">{balance?.currency || 'INR'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {wallet?.status === 'ACTIVE' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Wallet Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 border border-rose-100">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  Wallet Frozen
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-span-12 md:col-span-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between text-left">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              Perform instant wallet top-ups or peer-to-peer transfers inside the platform.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard/wallet?tab=add" className="block">
              <Button className="w-full flex items-center justify-center gap-2 h-11">
                <Plus className="h-4 w-4" />
                Add Money
              </Button>
            </Link>
            <Link to="/dashboard/wallet?tab=transfer" className="block">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 h-11">
                <ArrowUpRight className="h-4 w-4" />
                Transfer Money
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Monthly Summary stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Money Added */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs text-left">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
            Money Top-up (Last 50 Tx)
          </span>
          <span className="text-2xl font-black text-slate-900 mt-2 block">
            ₹{moneyAdded.toFixed(2)}
          </span>
        </div>

        {/* Money Sent */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs text-left">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
            Money Sent (Last 50 Tx)
          </span>
          <span className="text-2xl font-black text-red-600 mt-2 block">
            ₹{moneySent.toFixed(2)}
          </span>
        </div>

        {/* Money Received */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs text-left">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">
            Money Received (Last 50 Tx)
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">
            ₹{moneyReceived.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Activity History
            </h3>
            <p className="text-slate-500 text-xs">
              Daily wallet activities aggregated over the last 7 days of successful transactions
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-indigo-500" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Added" name="Top-up" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Sent" name="Debited" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Received" name="Credited" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <Link
              to="/dashboard/transactions"
              className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:text-brand-purple-dark"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No recent transactions found.
              </div>
            ) : (
              transactions.slice(0, 5).map((tx) => {
                const isSent = tx.type === 'TRANSFER' && tx.senderWalletId === walletId;
                const isReceived = tx.type === 'TRANSFER' && tx.receiverWalletId === walletId;
                const amount = (tx.amount || 0) / 100;

                return (
                  <div key={tx.transactionId} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY'
                            ? 'bg-purple-50 text-purple-600'
                            : isSent
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY' ? (
                          <Plus className="h-4.5 w-4.5" />
                        ) : isSent ? (
                          <ArrowUpRight className="h-4.5 w-4.5" />
                        ) : (
                          <ArrowDownLeft className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-slate-800 block">
                          {tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY'
                            ? 'Top-up Money'
                            : isSent
                            ? 'Transfer Sent'
                            : 'Transfer Received'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()} &bull; {tx.transactionId}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`text-sm font-bold block ${
                          tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY' || isReceived
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY' || isReceived ? '+' : '-'}
                        ₹{amount.toFixed(2)}
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${
                          tx.status === 'SUCCESS' || tx.status === 'SUCCEEDED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.status === 'FAILED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Notifications</h3>
            <Link
              to="/dashboard/notifications"
              className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:text-brand-purple-dark"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 5).length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No recent notifications found.
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif._id} className="flex items-start gap-3 py-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700">{notif.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                      {notif.status !== 'READ' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-purple"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
