import React, { useState, useEffect } from 'react';
import { 
    User, 
    Plus, 
    Trash2, 
    Search, 
    Shield, 
    User as UserIcon, 
    Phone, 
    Mail, 
    Loader2, 
    X, 
    MoreHorizontal,
    Filter,
    Download
} from 'lucide-react';
import { api } from '../lib/supabase';
import { User as AppUser } from '../types';

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'TENANT'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'TENANT' as 'ADMIN' | 'TENANT'
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? Action cannot be undone.")) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newUser = await api.createUser(formData);
      setUsers(prev => [newUser, ...prev]);
      setShowModal(false);
      setFormData({
        username: '', password: '', firstName: '', lastName: '', phone: '', email: '', role: 'TENANT'
      });
    } catch (error: any) {
      alert("Failed to create user. Username might be taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">Control system access and manage user accounts.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center gap-2">
                <Download size={16} /> Export
            </button>
            <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
            <Plus size={16} /> Add User
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card p-1 rounded-xl border border-border flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-9 py-2.5"
          />
        </div>
        <div className="h-8 w-px bg-border my-auto hidden sm:block"></div>
        <div className="flex items-center gap-1 p-1">
            {(['ALL', 'ADMIN', 'TENANT'] as const).map((role) => (
                <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        roleFilter === role 
                        ? 'bg-muted text-foreground shadow-sm border border-border' 
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                >
                    {role}
                </button>
            ))}
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Skeleton Loading
                Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4"><div className="h-10 bg-muted/50 rounded-lg w-48 animate-pulse"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-muted/50 rounded w-20 animate-pulse"></div></td>
                        <td className="px-6 py-4"><div className="h-8 bg-muted/50 rounded w-32 animate-pulse"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-muted/50 rounded w-24 animate-pulse"></div></td>
                        <td className="px-6 py-4"><div className="h-8 bg-muted/50 rounded w-8 ml-auto animate-pulse"></div></td>
                    </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <UserIcon className="mx-auto mb-2 opacity-20" size={32} />
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${user.role === 'ADMIN' ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                          {user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        user.role === 'ADMIN' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}>
                        {user.role === 'ADMIN' ? <Shield size={10} /> : <UserIcon size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         {user.phone && <div className="flex items-center gap-2 text-xs text-foreground"><Phone size={12} className="text-muted-foreground"/> {user.phone}</div>}
                         {user.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={12}/> {user.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                            <MoreHorizontal size={16} />
                        </button>
                        {user.username !== 'admin' && (
                            <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                            title="Delete"
                            >
                            <Trash2 size={16} />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-muted/20 p-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
             <span>Showing {filteredUsers.length} of {users.length} users</span>
             <div className="flex gap-1">
                 <button className="px-2 py-1 rounded border border-border hover:bg-card disabled:opacity-50" disabled>Previous</button>
                 <button className="px-2 py-1 rounded border border-border hover:bg-card disabled:opacity-50" disabled>Next</button>
             </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-foreground">Create New User</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">First Name</label>
                        <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground">Last Name</label>
                        <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Role</label>
                    <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                        <option value="TENANT">Tenant</option>
                        <option value="ADMIN">Administrator</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Username</label>
                    <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Password</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-lg text-sm font-bold hover:bg-muted/80">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex justify-center items-center">
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
