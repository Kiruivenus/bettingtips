"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

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
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setUsersList(data);
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
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update user');
      
      showToast(`User successfully ${!currentStatus ? 'blocked' : 'unblocked'}`, 'success');
      setUsersList(usersList.map(u => u._id === userId ? { ...u, isBlocked: !currentStatus } : u));
    } catch (error) {
      showToast('Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    if (userId === user?._id) {
      showToast('Cannot change your own role', 'error');
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setProcessingId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Failed to update user role');
      
      showToast('User role updated successfully', 'success');
      setUsersList(usersList.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      showToast('Failed to change role', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center transition-all ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <div className="mr-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <header className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Manage Users</h1>
        <p className="text-zinc-400">View registered members, check subscriptions, and handle account statuses.</p>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl border border-white/5" />)}
        </div>
      ) : usersList.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">No users found</h2>
          <p className="text-zinc-400 mb-6">There are no registered accounts in the system yet.</p>
        </div>
      ) : (
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-zinc-400 border-b border-white/10 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">User Details</th>
                  <th className="px-6 py-4 font-medium">Subscription</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Account Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors relative">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase shrink-0 mr-3">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white mb-0.5">{u.name || 'Unknown User'}</div>
                          <div className="text-xs text-zinc-500">{u.email || 'No email provided'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.activePlan ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-amber-400">{u.activePlan.name}</span>
                          <span className="text-[10px] text-zinc-400">Expires: {new Date(u.subscriptionExpiry).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs font-medium bg-white/5 px-2 py-1 rounded">No Active Plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${u.isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {processingId === u._id ? (
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block mr-4" />
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleRole(u._id, u.role)} 
                            disabled={u._id === user?._id}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Make {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button 
                            onClick={() => toggleBlockStatus(u._id, u.isBlocked)}
                            disabled={u._id === user?._id} 
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              u.isBlocked 
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
