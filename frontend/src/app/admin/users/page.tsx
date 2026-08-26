"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isBlocked: boolean;
  activePlan: { _id: string; name: string } | null;
  subscriptionExpiry: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsersList(data);
    } catch (error) {
      showToast('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleBlockStatus = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });
      if (!res.ok) throw new Error('Action failed');
      showToast(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`, 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update user status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setProcessingId(userId);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Action failed');
      showToast(`User role changed to ${newRole}`, 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update role', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = usersList.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded border shadow-lg text-xs font-medium ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Account Directory</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Registered Platform Users</h1>
          <p className="text-xs text-zinc-400">Manage user accounts, roles, block status, and active memberships.</p>
        </div>
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 w-full sm:w-64 rounded bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden font-numeric">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Active VIP Package</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">Loading user accounts...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSubActive = u.subscriptionExpiry && new Date(u.subscriptionExpiry) > new Date();
                  return (
                    <tr key={u._id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="block font-semibold text-zinc-100">{u.name || 'Unnamed User'}</span>
                        <span className="text-[11px] text-zinc-500">{u.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[10px]">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px]">
                            USER
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isSubActive && u.activePlan ? (
                          <span className="text-zinc-200 font-semibold">{u.activePlan.name}</span>
                        ) : (
                          <span className="text-zinc-500">None / Expired</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-bold text-[10px]">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px]">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => toggleRole(u._id, u.role)}
                          disabled={processingId === u._id}
                          className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          Role: {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          onClick={() => toggleBlockStatus(u._id, u.isBlocked)}
                          disabled={processingId === u._id}
                          className={`text-xs transition-colors ${u.isBlocked ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'}`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">No user accounts found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
