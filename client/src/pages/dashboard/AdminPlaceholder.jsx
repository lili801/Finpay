import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Wallet,
  History,
  DollarSign,
  Bell,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  Calendar,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

export const AdminPlaceholder = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Users Tab States
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Wallet Freeze/Activate States
  const [confirmingAction, setConfirmingAction] = useState(null); // { type: 'freeze'|'activate', userId: string, mobileNumber: string }
  const [processingWalletAction, setProcessingWalletAction] = useState(false);

  // Transactions Tab States
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
      setSummary(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load system stats.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // 2. Fetch Users List
  const fetchUsers = async (page = 1) => {
    setLoadingUsers(true);
    try {
      const queryParams = { page, limit: userPagination.limit };
      if (userSearch.trim()) {
        queryParams.search = userSearch.trim();
      }
      const response = await api.get('/admin/users', { params: queryParams });
      setUsers(response.data.data.users || []);
      setUserPagination(response.data.meta.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // 3. Fetch Selected User details
  const fetchUserDetails = async (userId) => {
    setLoadingUserDetails(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve user workspace details.');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // 4. Fetch Transactions List (Admin audit)
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
      setTransactions(response.data.data.transactions || []);
      setTxPagination(response.data.meta.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Failed to query transactions history.');
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
      // Refresh current details or list
      if (selectedUser && selectedUser.user._id === userId) {
        await fetchUserDetails(userId);
      }
      if (activeTab === 'users') {
        fetchUsers(userPagination.page);
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || `Failed to change wallet status.`;
      toast.error(message);
    } finally {
      setProcessingWalletAction(false);
    }
  };

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
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
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-brand-purple" />
            Admin Control Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitor system transactions, activate or freeze wallets, and view user details.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'border-brand-purple text-brand-purple-dark font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          System Summary
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-brand-purple text-brand-purple-dark font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-brand-purple text-brand-purple-dark font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Transaction Audit
        </button>
      </div>

      {/* Views */}
      <div className="mt-6">
        {/* SUMMARY STATS TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {loadingSummary ? (
              <div className="flex h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {/* 4x Grid of high level numbers */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Total Users */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Registered Users</span>
                      <span className="text-2xl font-black text-slate-900 block">{summary?.totalUsers || 0}</span>
                    </div>
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Total Wallets */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Wallets Created</span>
                      <span className="text-2xl font-black text-slate-900 block">{summary?.totalWallets || 0}</span>
                    </div>
                    <div className="h-10 w-10 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl">
                      <Wallet className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Total Transactions */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Transactions</span>
                      <span className="text-2xl font-black text-slate-900 block">{summary?.totalTransactions || 0}</span>
                    </div>
                    <div className="h-10 w-10 bg-amber-50 text-amber-600 flex items-center justify-center rounded-xl">
                      <History className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Total Balance */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Liquidity Pool</span>
                      <span className="text-2xl font-black text-slate-900 block">₹{summary?.totalWalletBalanceInRupees?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Daily volume stats */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-1">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Today's Transactions Count</span>
                    <span className="text-3xl font-extrabold text-slate-800 block">{summary?.todayTransactions || 0}</span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-1">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Today's Volume Sent</span>
                    <span className="text-3xl font-extrabold text-slate-800 block">₹{summary?.todayTransferVolumeInRupees?.toFixed(2) || '0.00'}</span>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-1 flex items-center justify-between">
                    <div>
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Pending Unread Notifications</span>
                      <span className="text-3xl font-extrabold text-slate-800 block">{summary?.unreadNotificationsCount || 0}</span>
                    </div>
                    <Bell className="h-8 w-8 text-indigo-500/40" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* User List Table */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between min-h-[50vh]">
              <div>
                {/* Search Bar */}
                <form onSubmit={handleUserSearchSubmit} className="p-4 border-b border-slate-100 flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search by name, mobile number, or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 h-10 text-xs"
                    />
                    <Search className="absolute left-3 top-[12px] h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <Button type="submit" size="sm" className="h-10 text-xs px-4">
                    Search
                  </Button>
                </form>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-5">Name</th>
                        <th className="py-3 px-5">Mobile Number</th>
                        <th className="py-3 px-5">Email</th>
                        <th className="py-3 px-5">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan="4" className="py-10 text-center">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-10 text-center text-slate-400">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr
                            key={u._id}
                            onClick={() => fetchUserDetails(u._id)}
                            className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                              selectedUser?.user?._id === u._id ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            <td className="py-3.5 px-5 font-semibold text-slate-800">
                              {u.firstName} {u.lastName}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 font-mono">{u.mobileNumber}</td>
                            <td className="py-3.5 px-5 text-slate-500">{u.email}</td>
                            <td className="py-3.5 px-5">
                              <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold ${
                                u.role === 'ADMIN' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Pagination */}
              {userPagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Page {userPagination.page} of {userPagination.totalPages}
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

            {/* Selected User Details Panel */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm min-h-[50vh]">
              {loadingUserDetails ? (
                <div className="flex h-full items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : !selectedUser ? (
                <div className="flex flex-col items-center justify-center text-center h-full py-20 text-slate-400 space-y-3">
                  <UserCheck className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-semibold">Select a User</p>
                  <p className="text-xs max-w-[200px]">Click any user in the table to display details and wallet controls.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedUser.user.firstName} {selectedUser.user.lastName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedUser.user._id}</p>
                  </div>

                  {/* Account detail list */}
                  <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Mobile Number</span>
                      <span className="font-semibold text-slate-800 font-mono">{selectedUser.user.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Email Address</span>
                      <span className="font-semibold text-slate-800">{selectedUser.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">System Role</span>
                      <span className="font-semibold text-slate-800 uppercase">{selectedUser.user.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Verified Email</span>
                      <span className={`font-bold ${selectedUser.user.isEmailVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {selectedUser.user.isEmailVerified ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>

                  {/* Wallet details */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Details</h4>
                    {!selectedUser.wallet ? (
                      <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
                        No Wallet matches this user.
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-500 font-medium">Wallet ID</span>
                          <span className="font-bold text-slate-700 font-mono">{selectedUser.wallet.id}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-500 font-medium">Wallet Balance</span>
                          <span className="text-base font-black text-slate-900">
                            ₹{selectedUser.wallet.balanceInRupees.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Wallet Status</span>
                          {selectedUser.wallet.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-800">
                              <ShieldAlert className="h-3 w-3 text-rose-600" />
                              Frozen
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Transactions Count</span>
                          <span className="font-bold text-slate-800">{selectedUser.transactionCount}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Freeze / Activation triggers */}
                  {selectedUser.wallet && (
                    <div className="pt-4 border-t border-slate-100">
                      {selectedUser.wallet.status === 'ACTIVE' ? (
                        <Button
                          variant="danger"
                          className="w-full flex items-center justify-center gap-1.5 h-10 text-xs"
                          onClick={() => setConfirmingAction({
                            type: 'freeze',
                            userId: selectedUser.user._id,
                            mobileNumber: selectedUser.user.mobileNumber
                          })}
                        >
                          <ShieldAlert className="h-4 w-4" />
                          Freeze User Wallet
                        </Button>
                      ) : (
                        <Button
                          className="w-full flex items-center justify-center gap-1.5 h-10 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setConfirmingAction({
                            type: 'activate',
                            userId: selectedUser.user._id,
                            mobileNumber: selectedUser.user.mobileNumber
                          })}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Activate User Wallet
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRANSACTION MONITORING TAB */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters Form */}
            <form onSubmit={handleTxFilterSubmit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {/* Transaction ID */}
                <div className="relative">
                  <Input
                    placeholder="Transaction ID..."
                    value={txSearchId}
                    onChange={(e) => setTxSearchId(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                  <Search className="absolute left-2.5 top-[11px] h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* User ID */}
                <div className="relative">
                  <Input
                    placeholder="User ID (Hex)..."
                    value={txFilterUserId}
                    onChange={(e) => setTxFilterUserId(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                  <Users className="absolute left-2.5 top-[11px] h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={txFilterStatus}
                    onChange={(e) => setTxFilterStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-xs focus:border-brand-purple focus:outline-hidden"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <select
                    value={txFilterType}
                    onChange={(e) => setTxFilterType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-xs focus:border-brand-purple focus:outline-hidden"
                  >
                    <option value="ALL">All Types</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="TOP_UP">Top-up</option>
                  </select>
                </div>

                {/* Date Filter */}
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
                <Button type="submit" size="sm" className="text-xs h-9 px-6">
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
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
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
                              {tx.transactionId}
                            </td>
                            <td className="py-3.5 px-6 text-slate-500">
                              {new Date(tx.createdAt).toLocaleDateString()} &bull; {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-6 text-slate-400 font-mono font-medium max-w-[120px] truncate" title={tx.senderWalletId}>
                              {tx.senderWalletId}
                            </td>
                            <td className="py-3.5 px-6 text-slate-400 font-mono font-medium max-w-[120px] truncate" title={tx.receiverWalletId}>
                              {tx.receiverWalletId}
                            </td>
                            <td className="py-3.5 px-6">
                              <span className="font-semibold text-slate-700 uppercase">{tx.type}</span>
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
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right font-bold text-slate-900 text-sm">
                              ₹{tx.amountInRupees.toFixed(2)}
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
                    Page {txPagination.page} of {txPagination.totalPages} ({txPagination.total} total transactions)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingAction(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  confirmingAction.type === 'freeze' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <AlertCircle className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Confirm Wallet Status Update
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Are you sure you want to {confirmingAction.type === 'freeze' ? 'freeze' : 'activate'} the wallet for user{' '}
                    <span className="font-bold text-slate-800">{confirmingAction.mobileNumber}</span>?
                    {confirmingAction.type === 'freeze' && ' This will block all credits, debits and transfers instantly.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={processingWalletAction}
                  onClick={() => setConfirmingAction(null)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={processingWalletAction}
                  className={`flex-1 ${confirmingAction.type === 'freeze' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  onClick={handleToggleWalletStatus}
                >
                  Confirm Action
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPlaceholder;
