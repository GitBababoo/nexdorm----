import React, { useState } from 'react';
import { Room, RoomStatus, Tenant, RoomHistory } from '../types';
import { 
  User, 
  Search, 
  Calendar, 
  LayoutGrid, 
  Clock, 
  Phone, 
  AlertTriangle,
  History,
  LogOut,
  X,
  MoreVertical
} from 'lucide-react';

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    [RoomStatus.VACANT]: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    [RoomStatus.OCCUPIED]: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    [RoomStatus.MAINTENANCE]: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  };
  // @ts-ignore
  return <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${styles[status] || ''}`}>{status}</span>;
};

interface RoomManagementProps {
  rooms: Room[];
  onUpdateRoom: (room: Room) => void;
}

export default function RoomManagement({ rooms, onUpdateRoom }: RoomManagementProps) {
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID'); // Changed Calendar to List for simplified CMS feel
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Form State
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    name: '', phone: '', leaseStart: new Date().toISOString().split('T')[0], leaseEnd: ''
  });

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchTerm) || room.currentTenant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = () => {
    if (!selectedRoom || !newTenant.name || !newTenant.leaseEnd) return;
    const updatedRoom: Room = {
      ...selectedRoom,
      status: RoomStatus.OCCUPIED,
      currentTenant: newTenant as Tenant
    };
    onUpdateRoom(updatedRoom);
    setSelectedRoom(null);
    setNewTenant({ name: '', phone: '', leaseStart: new Date().toISOString().split('T')[0], leaseEnd: '' });
  };

  const handleCheckOut = () => {
    if (!selectedRoom || !selectedRoom.currentTenant) return;
    const newHistory: RoomHistory = {
        id: `h-${Date.now()}`,
        tenantName: selectedRoom.currentTenant.name,
        startDate: selectedRoom.currentTenant.leaseStart,
        endDate: new Date().toISOString().split('T')[0],
        note: 'System Check-out'
    };
    const updatedRoom: Room = {
        ...selectedRoom, status: RoomStatus.VACANT, currentTenant: undefined, history: [newHistory, ...selectedRoom.history]
    };
    onUpdateRoom(updatedRoom);
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-foreground">Room Manager</h2>
            <p className="text-sm text-muted-foreground">Status overview and lease management.</p>
         </div>
         <div className="flex items-center bg-card border border-border p-1 rounded-lg">
            <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-md transition-colors ${viewMode === 'GRID' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Calendar size={18} /></button>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card p-1 rounded-xl border border-border flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search room number or tenant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-9 py-2.5"
          />
        </div>
        <div className="h-8 w-px bg-border my-auto hidden sm:block"></div>
        <div className="flex items-center gap-1 p-1">
             <select 
                className="bg-transparent text-sm font-medium text-muted-foreground outline-none cursor-pointer hover:text-foreground"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
             >
                 <option value="ALL">All Status</option>
                 <option value="VACANT">Vacant</option>
                 <option value="OCCUPIED">Occupied</option>
                 <option value="MAINTENANCE">Maintenance</option>
             </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((room) => (
              <div 
                key={room.id} 
                onClick={() => setSelectedRoom(room)}
                className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                {room.status === RoomStatus.OCCUPIED && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                {room.status === RoomStatus.VACANT && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                {room.status === RoomStatus.MAINTENANCE && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}

                <div className="flex justify-between items-start mb-3 pl-2">
                  <h3 className="text-xl font-bold text-foreground">{room.number}</h3>
                  <StatusBadge status={room.status} />
                </div>

                <div className="pl-2 space-y-3">
                    {room.status === RoomStatus.OCCUPIED ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                    <User size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{room.currentTenant?.name}</p>
                                    <p className="text-xs text-muted-foreground">{room.currentTenant?.phone}</p>
                                </div>
                            </div>
                            <div className="text-xs bg-muted/30 p-2 rounded flex justify-between text-muted-foreground">
                                <span>Ends: {room.currentTenant?.leaseEnd}</span>
                                <span className={getDaysRemaining(room.currentTenant!.leaseEnd) < 30 ? 'text-orange-500 font-bold' : ''}>
                                    {getDaysRemaining(room.currentTenant!.leaseEnd)} days left
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="py-3 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
                            <span className="block font-medium">Available</span>
                            <span className="text-xs">฿{room.price.toLocaleString()}/mo</span>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
      ) : (
        // List View (Simplified Table)
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                    <tr>
                        <th className="px-6 py-3">Room</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Tenant</th>
                        <th className="px-6 py-3">Lease End</th>
                        <th className="px-6 py-3 text-right">Price</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {filteredRooms.map(room => (
                        <tr key={room.id} onClick={() => setSelectedRoom(room)} className="hover:bg-muted/30 cursor-pointer transition-colors">
                            <td className="px-6 py-3 font-bold">{room.number}</td>
                            <td className="px-6 py-3"><StatusBadge status={room.status} /></td>
                            <td className="px-6 py-3 text-muted-foreground">{room.currentTenant?.name || '-'}</td>
                            <td className="px-6 py-3 text-muted-foreground">{room.currentTenant?.leaseEnd || '-'}</td>
                            <td className="px-6 py-3 text-right font-mono">฿{room.price.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* Modal details kept similar but styled cleaner */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95">
             <div className="bg-muted/30 border-b border-border p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">Room {selectedRoom.number} Details</h3>
                <button onClick={() => setSelectedRoom(null)} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
             </div>
             <div className="p-6">
                {selectedRoom.status === 'OCCUPIED' ? (
                    <div className="space-y-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-primary uppercase mb-3">Current Tenant</h4>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-bold text-foreground">{selectedRoom.currentTenant?.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRoom.currentTenant?.phone}</p>
                                </div>
                                <button onClick={handleCheckOut} className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg font-bold hover:bg-destructive/20 transition-colors">Check Out</button>
                            </div>
                        </div>
                        {/* History list snippet */}
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Lease History</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {selectedRoom.history.map(h => (
                                    <div key={h.id} className="text-xs flex justify-between p-2 bg-muted/30 rounded">
                                        <span>{h.tenantName}</span>
                                        <span className="text-muted-foreground">{h.endDate}</span>
                                    </div>
                                ))}
                                {selectedRoom.history.length === 0 && <p className="text-xs text-muted-foreground italic">No history available.</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 border border-dashed border-border rounded-xl bg-muted/10 text-center">
                            <p className="text-sm text-muted-foreground mb-4">This room is vacant. Register a new tenant below.</p>
                            <div className="space-y-3 text-left">
                                <input type="text" placeholder="Tenant Name" className="w-full bg-background border border-border rounded px-3 py-2 text-sm" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} />
                                <input type="text" placeholder="Phone Number" className="w-full bg-background border border-border rounded px-3 py-2 text-sm" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} />
                                <input type="date" className="w-full bg-background border border-border rounded px-3 py-2 text-sm" value={newTenant.leaseEnd} onChange={e => setNewTenant({...newTenant, leaseEnd: e.target.value})} />
                                <button onClick={handleCheckIn} className="w-full bg-primary text-primary-foreground py-2 rounded font-bold text-sm">Check In</button>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
