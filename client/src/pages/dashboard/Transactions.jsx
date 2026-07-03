import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Client-side search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTransactions = async (page = 1) => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get('/wallet'),
        api.get(`/wallet/transactions?page=${page}&limit=${pagination.limit}`),
      ]);

      setWallet(walletRes.data.data.wallet);
      setTransactions(txRes.data.data.transactions || []);
      setPagination(txRes.data.meta.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history.');
    }
  };

  useEffect(() => {
    fetchTransactions(1).finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions(pagination.page);
    setRefreshing(false);
    toast.success('Transactions history updated');
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setLoading(true);
    await fetchTransactions(newPage);
    setLoading(false);
  };

  // Client-side filter application
  const walletId = wallet?._id || wallet?.id;
  const filteredTransactions = transactions.filter((tx) => {
    const isSent = tx.type === 'TRANSFER' && tx.senderWalletId === walletId;
    const isReceived = tx.type === 'TRANSFER' && tx.receiverWalletId === walletId;

    // Search Query (ID or source name)
    const matchesSearch =
      tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    let matchesType = true;
    if (typeFilter === 'TOP_UP') {
      matchesType = tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY';
    } else if (typeFilter === 'SENT') {
      matchesType = tx.type === 'TRANSFER' && isSent;
    } else if (typeFilter === 'RECEIVED') {
      matchesType = tx.type === 'TRANSFER' && isReceived;
    }

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      matchesStatus = tx.status === statusFilter;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaction History</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and audit all credits, debits, and top-ups inside your account.
          </p>
        </div>
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

      {/* Filters Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm grid gap-4 md:grid-cols-12 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Input
            placeholder="Search by Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 placeholder:text-slate-400"
          />
          <Search className="absolute left-3.5 top-[12px] h-4 w-4 text-slate-400" />
        </div>

        {/* Type Filter */}
        <div className="md:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-xs focus:border-brand-purple focus:outline-hidden"
          >
            <option value="ALL">All Types</option>
            <option value="TOP_UP">Top-ups</option>
            <option value="SENT">Sent Transfers</option>
            <option value="RECEIVED">Received Transfers</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-xs focus:border-brand-purple focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xxs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">Transaction ID</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSent = tx.type === 'TRANSFER' && tx.senderWalletId === walletId;
                  const isReceived = tx.type === 'TRANSFER' && tx.receiverWalletId === walletId;
                  const amount = (tx.amount || 0) / 100;

                  return (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-slate-800">
                        {tx.transactionId}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-md ${
                              tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY'
                                ? 'bg-purple-50 text-purple-600'
                                : isSent
                                ? 'bg-red-50 text-red-600'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            {tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY' ? (
                              <Plus className="h-3.5 w-3.5" />
                            ) : isSent ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="font-medium text-slate-700">
                            {tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY'
                              ? 'Top-up'
                              : isSent
                              ? 'Sent to Peer'
                              : 'Received from Peer'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2 py-1 text-xxs font-bold uppercase tracking-wider rounded-sm ${
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
                      <td
                        className={`py-4 px-6 text-right font-bold text-base ${
                          tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY' || isReceived
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'TOP_UP' || tx.type === 'ADD_MONEY' || isReceived ? '+' : '-'}
                        ₹{amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total transactions)
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

export default Transactions;
