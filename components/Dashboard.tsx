import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { Users, DollarSign, AlertTriangle, TrendingUp, Activity, Calendar, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Room } from '../types';

const StatCard = ({ title, value, trend, trendUp, icon: Icon, subtext }: any) => (
  <div className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
        <div className="bg-muted p-2 rounded-lg text-muted-foreground">
            <Icon size={20} />
        </div>
        {trend && (
             <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${trendUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                {trendUp ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                {trend}
             </div>
        )}
    </div>
    <div className="mt-2">
        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  </div>
);

interface DashboardProps {
  onNavigate: (tab: string) => void;
  rooms: Room[];
}

export default function Dashboard({ onNavigate, rooms }: DashboardProps) {
  const [stats, setStats] = useState({
    occupied: 0,
    vacant: 0,
    maintenance: 0,
    occupancyRate: 0,
    revenue: 0
  });

  useEffect(() => {
    if (rooms.length > 0) {
        const occ = rooms.filter(r => r.status === 'OCCUPIED').length;
        const vac = rooms.filter(r => r.status === 'VACANT').length;
        const maint = rooms.filter(r => r.status === 'MAINTENANCE').length;
        const revenue = rooms.reduce((acc, r) => r.status === 'OCCUPIED' ? acc + r.price : acc, 0);
        
        setStats({
            occupied: occ,
            vacant: vac,
            maintenance: maint,
            occupancyRate: Math.round((occ / rooms.length) * 100),
            revenue: revenue
        });
    }
  }, [rooms]);

  // Mock Data for Professional Charts
  const revenueData = [
    { name: 'Jan', revenue: 45000, expenses: 12000 },
    { name: 'Feb', revenue: 52000, expenses: 15000 },
    { name: 'Mar', revenue: 48000, expenses: 10000 },
    { name: 'Apr', revenue: 61000, expenses: 18000 },
    { name: 'May', revenue: 55000, expenses: 14000 },
    { name: 'Jun', revenue: 67000, expenses: 16000 },
    { name: 'Jul', revenue: 72000, expenses: 15500 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} /> Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onNavigate('rooms')} className="bg-card hover:bg-accent border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Manage Rooms
            </button>
            <button onClick={() => onNavigate('billing')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
                Create Invoice
            </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Monthly Revenue" 
            value={`฿${stats.revenue.toLocaleString()}`} 
            trend="12.5%" 
            trendUp={true}
            icon={DollarSign}
            subtext="Projected for this month"
        />
        <StatCard 
            title="Occupancy Rate" 
            value={`${stats.occupancyRate}%`} 
            trend="2.4%" 
            trendUp={true}
            icon={Users}
            subtext={`${stats.occupied} occupied / ${rooms.length} total`}
        />
        <StatCard 
            title="Active Maintenance" 
            value={stats.maintenance.toString()} 
            trend="Low" 
            trendUp={false} // Red is good here if meaning 'down'? context matters. Let's say false = red = bad usually, but here let's stick to design.
            icon={AlertTriangle}
            subtext="Open tickets requiring action"
        />
        <StatCard 
            title="Net Profit Margin" 
            value="42%" 
            trend="5%" 
            trendUp={true}
            icon={TrendingUp}
            subtext="After operational costs"
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-foreground">Financial Performance</h3>
                    <p className="text-xs text-muted-foreground">Revenue vs Expenses (YTD)</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs text-muted-foreground"><span className="w-2 h-2 bg-primary rounded-full mr-1"></span> Revenue</span>
                    <span className="flex items-center text-xs text-muted-foreground"><span className="w-2 h-2 bg-destructive/50 rounded-full mr-1"></span> Expenses</span>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="expenses" stroke="var(--destructive)" strokeWidth={2} strokeOpacity={0.5} fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Room Status List */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col">
            <h3 className="font-bold text-foreground mb-4">Quick Status</h3>
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium">Occupied Rooms</span>
                    </div>
                    <span className="font-bold">{stats.occupied}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                        <span className="text-sm font-medium">Vacant Rooms</span>
                    </div>
                    <span className="font-bold">{stats.vacant}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium">Maintenance</span>
                    </div>
                    <span className="font-bold">{stats.maintenance}</span>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">Recent Activities</h4>
                <div className="space-y-3">
                    <div className="flex gap-3 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                        <div>
                            <p className="text-foreground font-medium">Invoice #INV-2025-001 Paid</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                        <Activity size={16} className="text-primary mt-0.5" />
                        <div>
                            <p className="text-foreground font-medium">New Tenant Registered</p>
                            <p className="text-xs text-muted-foreground">Room 101 • 5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
