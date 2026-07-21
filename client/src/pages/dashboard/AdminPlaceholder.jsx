import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Wallet,
  History,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

// Data safety helper functions
const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return isNaN(num) ? fallback : num;
};

const formatMoney = (val) => {
  const num = safeNumber(val, 0);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCount = (val) => {
  const num = safeNumber(val, 0);
  return num.toLocaleString('en-IN');
};

export const AdminPlaceholder = () => {
  const [activeTab, setActiveTab] = useState('summary');

  // Summary state
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Users Tab state
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Wallet Freeze/Activate confirmation state
  const [confirmingAction, setConfirmingAction] = useState(null); // { type: 'freeze'|'activate', userId: string, mobileNumber: string, userName: string }
  const [processingWalletAction, setProcessingWalletAction] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  // Transactions Tab state
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loadingTx, setLoadingTx] = useState(false);

  // Transaction Filters
  const [txSearchId, setTxSearchId] = useState('');
  const [txFilterStatus, setTxFilterStatus] = useState('ALL');
  const [txFilterType, setTxFilterType] = useState('ALL');
  const [txFilterUserId, setTxFilterUserId] = useState('');
  const [txFilterDate, setTxFilterDate] = useState('');

  // 1. Fetch Summary Stats
  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await api.get('/admin/summary');
      setSummary(response.data?.data || null);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error?.message || 'Failed to load system stats.';
      toast.error(msg);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 2. Fetch Users List with enriched wallet information for single table view
  const fetchUsers = async (page = 1) => {
    setLoadingUsers(true);
    try {
      const queryParams = { page, limit: userPagination.limit };
      if (userSearch.trim()) {
        queryParams.search = userSearch.trim();
      }
      const response = await api.get('/admin/users', { params: queryParams });
      const data = response.data?.data;
      const meta = response.data?.meta;
      const rawUsers = data?.users || [];

      if (meta?.pagination) {
        setUserPagination({
          page: safeNumber(meta.pagination.page, 1),
          limit: safeNumber(meta.pagination.limit, 10),
          total: safeNumber(meta.pagination.total, 0),
          totalPages: safeNumber(meta.pagination.totalPages, 1),
        });
      }

      // Concurrently fetch wallet details & transaction counts for each user row
      const usersWithDetails = await Promise.all(
        rawUsers.map(async (u) => {
          try {
            const detailRes = await api.get(`/admin/users/${u._id}`);
            return {
              ...u,
              wallet: detailRes.data?.data?.wallet || null,
              transactionCount: detailRes.data?.data?.transactionCount || 0,
            };
          } catch {
            return { ...u, wallet: null, transactionCount: 0 };
          }
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error?.message || 'Failed to load users list.';
      toast.error(msg);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 3. Fetch Transactions List
  const fetchTransactions = async (page = 1) => {
    setLoadingTx(true);
    try {
      const params = { page, limit: txPagination.limit };
      if (txSearchId.trim()) params.transactionId = txSearchId.trim();
      if (txFilterStatus !== 'ALL') params.status = txFilterStatus;
      if (txFilterType !== 'ALL') params.type = txFilterType;
      if (txFilterUserId.trim()) params.userId = txFilterUserId.trim();
      if (txFilterDate.trim()) params.date = txFilterDate.trim();

      const response = await api.get('/admin/transactions', { params });
      const data = response.data?.data;
      const meta = response.data?.meta;
      setTransactions(data?.transactions || []);
      if (meta?.pagination) {
        setTxPagination({
          page: safeNumber(meta.pagination.page, 1),
          limit: safeNumber(meta.pagination.limit, 15),
          total: safeNumber(meta.pagination.total, 0),
          totalPages: safeNumber(meta.pagination.totalPages, 1),
        });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error?.message || 'Failed to query transactions history.';
      toast.error(msg);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'summary') {
      fetchSummary();
    } else if (activeTab === 'users') {
      fetchUsers(1);
    } else if (activeTab === 'transactions') {
      fetchTransactions(1);
    }
  }, [activeTab]);

  // Handle wallet freeze / activation operations
  const handleToggleWalletStatus = async () => {
    if (!confirmingAction) return;
    setProcessingWalletAction(true);
    const { type, userId } = confirmingAction;

    try {
      const endpoint = `/admin/users/${userId}/wallet/${type === 'freeze' ? 'freeze' : 'activate'}`;
      await api.patch(endpoint);
      toast.success(`Wallet successfully ${type === 'freeze' ? 'frozen' : 'activated'}!`);
      setConfirmingAction(null);

      // Refresh current user list
      fetchUsers(userPagination.page);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || `Failed to update wallet status.`;
      toast.error(message);
    } finally {
      setProcessingWalletAction(false);
    }
  };

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleClearUserSearch = () => {
    setUserSearch('');
    setTimeout(() => {
      fetchUsers(1);
    }, 50);
  };

  const handleTxFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const handleResetTxFilters = () => {
    setTxSearchId('');
    setTxFilterStatus('ALL');
    setTxFilterType('ALL');
    setTxFilterUserId('');
    setTxFilterDate('');
    setTimeout(() => {
      fetchTransactions(1);
    }, 50);
  };

  return (
    <div className="space-y-6 text-left pb-12 max-w-7xl mx-auto">
      {/* Admin Title Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            FinPay Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Production system summary metrics, searchable user management, and read-only transaction auditing.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'border-red-600 text-red-700 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Dashboard Summary
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-red-600 text-red-700 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-red-600 text-red-700 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Transaction Audit
        </button>
      </div>

      {/* Views Container */}
      <div className="mt-6">
        {/* A. DASHBOARD SUMMARY MODULE */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {loadingSummary ? (
              <div className="flex h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Users */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
                    <span className="text-3xl font-black text-slate-900 block">{formatCount(summary?.totalUsers)}</span>
                  </div>
                  <div className="h-12 w-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                {/* Total Wallets */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Active Wallets</span>
                    <span className="text-3xl font-black text-slate-900 block">{formatCount(summary?.totalWallets)}</span>
                  </div>
                  <div className="h-12 w-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-2xl">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>

                {/* Total Transactions */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Transactions</span>
                    <span className="text-3xl font-black text-slate-900 block">{formatCount(summary?.totalTransactions)}</span>
                  </div>
                  <div className="h-12 w-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-2xl">
                    <History className="h-6 w-6" />
                  </div>
                </div>

                {/* Today's Transactions */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Today's Transactions</span>
                    <span className="text-3xl font-black text-slate-900 block">{formatCount(summary?.todayTransactions)}</span>
                  </div>
                  <div className="h-12 w-12 bg-rose-50 text-rose-600 flex items-center justify-center rounded-2xl">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* B. USER MANAGEMENT MODULE - SINGLE SEARCHABLE USER TABLE */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between min-h-[50vh]">
            <div>
              {/* Single Search Bar Header */}
              <form onSubmit={handleUserSearchSubmit} className="p-4 border-b border-slate-100 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search users by name, mobile number, or email address..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-8 h-10 text-xs"
                  />
                  <Search className="absolute left-3 top-[12px] h-3.5 w-3.5 text-slate-400" />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={handleClearUserSearch}
                      className="absolute right-3 top-[12px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Button type="submit" size="sm" className="h-10 text-xs px-5 bg-slate-900 hover:bg-slate-800">
                  Search
                </Button>
              </form>

              {/* Single Full-Width Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">User Name</th>
                      <th className="py-3.5 px-5">Mobile Number</th>
                      <th className="py-3.5 px-5">Email Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="3" className="py-12 text-center">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-slate-400">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => setSelectedUserForModal(u)}>
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            {u.firstName || ''} {u.lastName || ''}
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 font-mono font-medium">{u.mobileNumber || ''}</td>
                          <td className="py-3.5 px-5 text-slate-500">{u.email || ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {userPagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Page {formatCount(userPagination.page)} of {formatCount(userPagination.totalPages)} ({formatCount(userPagination.total)} total users)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPagination.page <= 1}
                    onClick={() => fetchUsers(userPagination.page - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPagination.page >= userPagination.totalPages}
                    onClick={() => fetchUsers(userPagination.page + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* C. TRANSACTION AUDIT MODULE */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters Form */}
            <form onSubmit={handleTxFilterSubmit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {/* Search by Transaction ID */}
                <div className="relative">
                  <Input
                    placeholder="Transaction ID..."
                    value={txSearchId}
                    onChange={(e) => setTxSearchId(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                  <Search className="absolute left-2.5 top-[11px] h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* Filter by User ID */}
                <div className="relative">
                  <Input
                    placeholder="User ID..."
                    value={txFilterUserId}
                    onChange={(e) => setTxFilterUserId(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                  <Users className="absolute left-2.5 top-[11px] h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* Filter by Status */}
                <div>
                  <select
                    value={txFilterStatus}
                    onChange={(e) => setTxFilterStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-xs focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                {/* Filter by Type */}
                <div>
                  <select
                    value={txFilterType}
                    onChange={(e) => setTxFilterType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-xs focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="ALL">All Types</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="TOP_UP">Top-up</option>
                  </select>
                </div>

                {/* Filter by Date */}
                <div className="relative">
                  <Input
                    type="date"
                    value={txFilterDate}
                    onChange={(e) => setTxFilterDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-50 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={handleResetTxFilters} className="text-xs h-9">
                  Reset Filters
                </Button>
                <Button type="submit" size="sm" className="text-xs h-9 px-6 bg-slate-900 hover:bg-slate-800">
                  Apply Filters
                </Button>
              </div>
            </form>

            {/* Transactions Audit Table */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between min-h-[50vh]">
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Transaction ID</th>
                        <th className="py-3 px-6">Date</th>
                        <th className="py-3 px-6">Sender Wallet</th>
                        <th className="py-3 px-6">Receiver Wallet</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {loadingTx ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            No transactions found matching the query.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id || tx.transactionId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-semibold text-slate-800">
                              {tx.transactionId || tx.id || 'N/A'}
                            </td>
                            <td className="py-3.5 px-6 text-slate-500">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'} &bull;{' '}
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </td>
                            <td className="py-3.5 px-6 text-slate-400 font-mono font-medium max-w-[120px] truncate" title={tx.senderWalletId}>
                              {tx.senderWalletId || 'N/A'}
                            </td>
                            <td className="py-3.5 px-6 text-slate-400 font-mono font-medium max-w-[120px] truncate" title={tx.receiverWalletId}>
                              {tx.receiverWalletId || 'N/A'}
                            </td>
                            <td className="py-3.5 px-6">
                              <span className="font-semibold text-slate-700 uppercase">{tx.type || 'N/A'}</span>
                            </td>
                            <td className="py-3.5 px-6">
                              <span
                                className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${
                                  tx.status === 'SUCCESS' || tx.status === 'SUCCEEDED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : tx.status === 'FAILED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}
                              >
                                {tx.status || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right font-bold text-slate-900 text-sm">
                              ₹{formatMoney(tx.amountInRupees)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Pagination */}
              {txPagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Page {formatCount(txPagination.page)} of {formatCount(txPagination.totalPages)} ({formatCount(txPagination.total)} total transactions)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={txPagination.page <= 1}
                      onClick={() => fetchTransactions(txPagination.page - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={txPagination.page >= txPagination.totalPages}
                      onClick={() => fetchTransactions(txPagination.page + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmingAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingAction(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    confirmingAction.type === 'freeze' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  <AlertCircle className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Confirm Wallet Status Update</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Are you sure you want to <span className="font-bold">{confirmingAction.type === 'freeze' ? 'freeze' : 'activate'}</span> the wallet for{' '}
                    <span className="font-bold text-slate-800">{confirmingAction.userName}</span> ({confirmingAction.mobileNumber})?
                    {confirmingAction.type === 'freeze' && ' This will block all wallet debits and transfers.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  disabled={processingWalletAction}
                  onClick={() => setConfirmingAction(null)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={processingWalletAction}
                  className={`flex-1 text-xs ${
                    confirmingAction.type === 'freeze' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  onClick={handleToggleWalletStatus}
                >
                  Confirm Action
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* USER DETAILS MODAL */}
        {selectedUserForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900">User Details</h3>
                <button onClick={() => setSelectedUserForModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Name:</span>
                  <span className="font-bold text-slate-900">{selectedUserForModal.firstName || ''} {selectedUserForModal.lastName || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Email:</span>
                  <span>{selectedUserForModal.email || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Mobile Number:</span>
                  <span className="font-mono">{selectedUserForModal.mobileNumber || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Role:</span>
                  <span className="uppercase font-bold">{selectedUserForModal.role || 'USER'}</span>
                </div>
                
                {selectedUserForModal.wallet && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-500">Wallet Status:</span>
                      <span className="uppercase font-bold">
                        {selectedUserForModal.wallet.status === 'ACTIVE' ? (
                          <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Active</span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> Frozen</span>
                        )}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                      {selectedUserForModal.wallet.status === 'ACTIVE' ? (
                        <Button
                          variant="danger"
                          className="flex-1 text-xs bg-rose-600 hover:bg-rose-700"
                          onClick={() => {
                            setConfirmingAction({
                              type: 'freeze',
                              userId: selectedUserForModal._id,
                              mobileNumber: selectedUserForModal.mobileNumber,
                              userName: `${selectedUserForModal.firstName} ${selectedUserForModal.lastName}`,
                            });
                            setSelectedUserForModal(null);
                          }}
                        >
                          Freeze Wallet
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => {
                            setConfirmingAction({
                              type: 'activate',
                              userId: selectedUserForModal._id,
                              mobileNumber: selectedUserForModal.mobileNumber,
                              userName: `${selectedUserForModal.firstName} ${selectedUserForModal.lastName}`,
                            });
                            setSelectedUserForModal(null);
                          }}
                        >
                          Activate Wallet
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPlaceholder;
