
import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Wrench, 
  User, 
  LogOut, 
  Bell, 
  Package, 
  ChevronRight, 
  CreditCard, 
  Clock, 
  CheckCircle,
  Droplets,
  Zap,
  Camera,
  Phone,
  Shield,
  QrCode,
  History,
  Sparkles,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';
import { Room, Invoice, Parcel, MaintenanceRequest, MaintenanceStatus, AppSettings } from '../types';

interface TenantPortalProps {
  roomNumber: string;
  onLogout: () => void;
  rooms: Room[];
  parcels: Parcel[];
  maintenanceRequests: MaintenanceRequest[];
  invoices: Invoice[];
  onAddMaintenance: (req: MaintenanceRequest) => void;
  settings: AppSettings;
}

export default function TenantPortal({ 
    roomNumber, 
    onLogout, 
    rooms, 
    parcels, 
    maintenanceRequests,
    invoices,
    onAddMaintenance,
    settings
}: TenantPortalProps) {
  const [activeTab, setActiveTab] = useState<'HOME' | 'BILL' | 'REPAIR' | 'PROFILE'>('HOME');
  const [newRepairDesc, setNewRepairDesc] = useState('');
  const [repairCategory, setRepairCategory] = useState('General');
  const [showDigitalId, setShowDigitalId] = useState(false);

  // 1. Find Room Data
  const roomData = rooms.find(r => r.number === roomNumber);
  const tenantName = roomData?.currentTenant?.name || "ผู้เช่า";
  
  // 2. Filter Parcels
  const myParcels = parcels.filter(p => p.roomNumber === roomNumber && p.status === 'WAITING');
  const parcelHistory = parcels.filter(p => p.roomNumber === roomNumber && p.status === 'COLLECTED');

  // 3. Filter Maintenance
  const myMaintenance = maintenanceRequests.filter(m => m.roomId === roomData?.id || m.roomId === `manual-${roomNumber}`);

  // 4. Get Real Invoice (Latest one)
  const myInvoices = invoices.filter(inv => inv.roomNumber === roomNumber).sort((a, b) => (b.year - a.year) || (parseInt(b.month) - parseInt(a.month))); // Mock sort logic, effectively grabbing latest if array order matches creation
  const latestInvoice = myInvoices.length > 0 ? myInvoices[0] : null; // Assuming newest first from parent or sorting here

  const handleSendRepair = () => {
      if(!newRepairDesc) return;
      
      onAddMaintenance({
          id: `m-${Date.now()}`,
          roomId: roomData?.id || `manual-${roomNumber}`,
          description: newRepairDesc,
          category: repairCategory,
          priority: 'MEDIUM', // Default
          status: MaintenanceStatus.PENDING,
          reportedAt: new Date().toISOString().split('T')[0]
      });
      setNewRepairDesc('');
      setRepairCategory('General');
      // Alert handled by Toast in Parent (if connected) or simple alert here
      alert("ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว เจ้าหน้าที่จะรีบดำเนินการครับ");
  };

  // --- SUB-COMPONENTS ---

  const DigitalIdCard = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in zoom-in duration-300" onClick={() => setShowDigitalId(false)}>
        <div className="w-full max-w-sm bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{settings.dormName}</h3>
                        <p className="text-xs opacity-80">Tenant ID Card</p>
                    </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-full p-1">
                    {/* Mock QR */}
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                        <QrCode size={20} />
                    </div>
                </div>
            </div>

            <div className="space-y-1 mb-8 relative z-10">
                <p className="text-sm opacity-70 uppercase tracking-wider">Resident Name</p>
                <h2 className="text-3xl font-bold tracking-tight">{tenantName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-black/20 p-3 rounded-xl">
                    <p className="text-xs opacity-70">Room No.</p>
                    <p className="text-xl font-bold">{roomNumber}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl">
                    <p className="text-xs opacity-70">Status</p>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="font-medium">Active</p>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-center opacity-60">Show this card to security or staff for verification.</p>
        </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground p-6 pt-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
         
         <div className="flex justify-between items-start relative z-10 mb-6">
            <div>
                <p className="opacity-80 text-sm mb-1">Welcome back,</p>
                <h1 className="text-3xl font-extrabold tracking-tight">{tenantName.split(' ')[0]}</h1>
                <button onClick={() => setShowDigitalId(true)} className="mt-2 flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full backdrop-blur-sm">
                    <QrCode size={12} /> View Digital ID
                </button>
            </div>
            <div className="relative">
                <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-white/30 transition-all">
                    <Bell className="text-white" size={24} />
                </div>
                {(myParcels.length > 0 || (latestInvoice && !latestInvoice.isPaid)) && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-primary animate-bounce"></span>
                )}
            </div>
         </div>

         {/* Monthly Summary Widget */}
         <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex justify-between items-center">
            <div>
                <p className="text-xs opacity-70 mb-1">ยอดที่ต้องชำระ (Current Due)</p>
                {latestInvoice && !latestInvoice.isPaid ? (
                    <p className="text-2xl font-bold">฿{latestInvoice.total.toLocaleString()}</p>
                ) : (
                    <div className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle size={18} />
                        <span className="font-bold">จ่ายครบแล้ว</span>
                    </div>
                )}
            </div>
            <button onClick={() => setActiveTab('BILL')} className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                {latestInvoice && !latestInvoice.isPaid ? 'จ่ายบิล' : 'ประวัติ'}
            </button>
         </div>
      </div>

      <div className="px-6 -mt-4 relative z-10 space-y-6">
          {/* Parcel Alert */}
          {myParcels.length > 0 && (
             <div className="bg-background border border-border p-4 rounded-2xl shadow-md flex items-center gap-4 animate-pulse">
                 <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
                     <Package size={24} />
                 </div>
                 <div className="flex-1">
                     <h4 className="font-bold text-foreground">มีพัสดุมาใหม่ {myParcels.length} ชิ้น</h4>
                     <p className="text-xs text-muted-foreground">กรุณาติดต่อรับที่สำนักงานนิติฯ</p>
                 </div>
                 <ChevronRight size={20} className="text-muted-foreground" />
             </div>
          )}

          {/* Quick Actions */}
          <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => setActiveTab('REPAIR')} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                          <Wrench size={20} />
                      </div>
                      <span className="text-xs font-medium text-foreground">แจ้งซ่อม</span>
                  </button>
                  <button onClick={() => window.open(`tel:021234567`)} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                      <div className="bg-green-100 text-green-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                          <Phone size={20} />
                      </div>
                      <span className="text-xs font-medium text-foreground">นิติบุคคล</span>
                  </button>
                  <button onClick={() => setShowDigitalId(true)} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                      <div className="bg-purple-100 text-purple-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                          <Shield size={20} />
                      </div>
                      <span className="text-xs font-medium text-foreground">My ID</span>
                  </button>
              </div>
          </div>

          {/* Recent Announcements */}
          <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">ข่าวสารหอพัก</h3>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-primary" />
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">ประกาศล่าสุด</span>
                  </div>
                  <h4 className="font-bold text-foreground">ยินดีต้อนรับสู่ {settings.dormName}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      หากพบปัญหาการใช้งาน สามารถแจ้งผ่านเมนู "แจ้งซ่อม" ได้ตลอด 24 ชม. หรือติดต่อฉุกเฉินกดปุ่มโทรได้เลยครับ
                  </p>
              </div>
          </div>
      </div>
    </div>
  );

  const renderBill = () => (
    <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">บิลของฉัน 🧾</h2>
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Room {roomNumber}
            </div>
        </div>
        
        {latestInvoice ? (
            <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border relative">
                {/* Card Header */}
                <div className="bg-slate-900 text-white p-6 text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-50"></div>
                     <p className="text-slate-400 text-xs uppercase tracking-wider relative z-10">ยอดชำระประจำเดือน {latestInvoice.month}</p>
                     <h1 className="text-4xl font-bold mt-2 relative z-10">฿{latestInvoice.total.toLocaleString()}</h1>
                     <div className="mt-4 flex justify-center relative z-10">
                        <span className={`${latestInvoice.isPaid ? 'bg-emerald-500 text-white' : 'bg-white text-red-500'} text-xs font-bold px-4 py-1.5 rounded-full shadow-md`}>
                            {latestInvoice.isPaid ? 'ชำระเรียบร้อย (Paid)' : `ครบกำหนด ${latestInvoice.dueDate}`}
                        </span>
                     </div>
                </div>

                {/* Bill Details */}
                <div className="p-6 space-y-5">
                    {/* Rent */}
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Home size={18} /></div>
                            <span className="text-sm font-medium text-muted-foreground">ค่าเช่าห้อง</span>
                        </div>
                        <span className="font-bold text-foreground">฿{latestInvoice.rentPrice.toLocaleString()}</span>
                    </div>

                    {/* Water */}
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-50 p-2 rounded-xl text-cyan-600"><Droplets size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">ค่าน้ำประปา</span>
                                <span className="text-[10px] text-muted-foreground/70">{latestInvoice.waterUnit} หน่วย x {settings.waterRate}฿</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-foreground block">฿{latestInvoice.waterPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground">({latestInvoice.prevWater} → {latestInvoice.currWater})</span>
                        </div>
                    </div>

                    {/* Electric */}
                    <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-50 p-2 rounded-xl text-amber-600"><Zap size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-muted-foreground">ค่าไฟฟ้า</span>
                                <span className="text-[10px] text-muted-foreground/70">{latestInvoice.elecUnit} หน่วย x {settings.elecRate}฿</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-foreground block">฿{latestInvoice.elecPrice.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground">({latestInvoice.prevElec} → {latestInvoice.currElec})</span>
                        </div>
                    </div>

                    {/* Common Fee */}
                    <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-3 pl-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                             <span className="text-sm text-muted-foreground">ค่าส่วนกลาง</span>
                        </div>
                        <span className="font-medium text-muted-foreground">฿{settings.commonFee}</span>
                    </div>
                </div>

                {/* Payment Action */}
                {!latestInvoice.isPaid && (
                    <div className="p-4 bg-muted/30 text-center border-t border-border">
                        <div className="bg-white p-3 rounded-xl border border-border inline-block mb-2 shadow-sm">
                            <div className="w-28 h-28 bg-slate-900 flex items-center justify-center text-white text-xs rounded">
                                <QrCode size={40} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">สแกน QR เพื่อชำระเงิน</p>
                        <button className="mt-3 w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                            แจ้งโอนเงิน
                        </button>
                    </div>
                )}
            </div>
        ) : (
             <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border border-border border-dashed">
                 <FileText size={48} className="mx-auto mb-3 opacity-20" />
                 <p>ไม่พบรายการบิลค้างชำระ</p>
                 <p className="text-xs mt-1">คุณเป็นลูกบ้านตัวอย่างที่ดีมาก! 🎉</p>
             </div>
        )}

        {/* History Link */}
        <div className="mt-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-3">ประวัติการชำระเงิน</h3>
            <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                {myInvoices.slice(1, 3).map(inv => (
                    <div key={inv.id} className="flex justify-between items-center p-3 bg-card rounded-xl border border-border">
                        <span className="text-sm font-medium text-foreground">งวด {inv.month} {inv.year}</span>
                        <span className="text-sm font-bold text-foreground">฿{inv.total.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderRepair = () => (
    <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">แจ้งซ่อม 🛠️</h2>
         </div>

         <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
             <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                 <Sparkles className="text-primary" size={18} /> แจ้งปัญหาใหม่
             </h3>
             
             <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
                 {['General', 'Plumbing', 'Electric', 'Appliance', 'Internet'].map(cat => (
                     <button 
                        key={cat}
                        onClick={() => setRepairCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${repairCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                     >
                         {cat}
                     </button>
                 ))}
             </div>

             <textarea 
                value={newRepairDesc}
                onChange={(e) => setNewRepairDesc(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl p-4 text-sm h-32 outline-none focus:ring-2 focus:ring-primary resize-none transition-shadow"
                placeholder={`ระบุอาการเสียของ ${repairCategory} เช่น ไฟดับ, น้ำรั่ว...`}
             ></textarea>
             
             <div className="mt-4 flex gap-3">
                 <button className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
                     <Camera size={18} /> แนบรูป
                 </button>
                 <button 
                    onClick={handleSendRepair}
                    disabled={!newRepairDesc}
                    className="flex-[2] bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none hover:opacity-90 transition-all"
                 >
                     ส่งเรื่องแจ้งซ่อม
                 </button>
             </div>
         </div>

         <div>
             <h3 className="font-bold text-muted-foreground mb-3 px-1 text-sm uppercase tracking-wider">สถานะงานซ่อม</h3>
             <div className="space-y-3">
                 {myMaintenance.length === 0 && (
                     <div className="text-center text-muted-foreground py-8 text-sm bg-muted/20 rounded-2xl border border-dashed border-border">
                        <Wrench size={32} className="mx-auto mb-2 opacity-20" />
                        ไม่มีรายการแจ้งซ่อม
                     </div>
                 )}
                 {myMaintenance.map((req) => (
                    <div key={req.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                             <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl mt-1 ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {req.status === 'COMPLETED' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{req.category}</span>
                                    <p className="text-sm font-bold text-foreground mt-1 line-clamp-2">{req.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Clock size={10} /> {req.reportedAt}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Steps */}
                        <div className="bg-muted/30 p-3 rounded-xl flex items-center justify-between relative overflow-hidden">
                             {req.status === 'COMPLETED' ? (
                                 <div className="w-full text-center text-green-600 font-bold text-xs flex items-center justify-center gap-2">
                                     <CheckCircle size={14} /> ดำเนินการซ่อมเสร็จสิ้น
                                 </div>
                             ) : (
                                 <>
                                    <div className="flex flex-col items-center gap-1 z-10">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span className="text-[10px] font-bold text-primary">แจ้งแล้ว</span>
                                    </div>
                                    <div className="h-0.5 bg-border flex-1 mx-2"></div>
                                    <div className="flex flex-col items-center gap-1 z-10">
                                        <div className={`w-2 h-2 rounded-full ${req.status === 'IN_PROGRESS' ? 'bg-orange-500' : 'bg-muted-foreground/30'}`}></div>
                                        <span className={`text-[10px] font-bold ${req.status === 'IN_PROGRESS' ? 'text-orange-500' : 'text-muted-foreground'}`}>กำลังซ่อม</span>
                                    </div>
                                    <div className="h-0.5 bg-border flex-1 mx-2"></div>
                                    <div className="flex flex-col items-center gap-1 z-10">
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                                        <span className="text-[10px] font-bold text-muted-foreground">เสร็จสิ้น</span>
                                    </div>
                                 </>
                             )}
                        </div>
                    </div>
                 ))}
             </div>
         </div>
    </div>
  );

  const renderProfile = () => (
      <div className="p-6 pb-24 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-2xl font-bold text-foreground">โปรไฟล์</h2>
          
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-violet-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <User size={40} />
              </div>
              <div className="relative z-10">
                  <h3 className="font-bold text-xl text-foreground">{tenantName}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{roomData?.currentTenant?.phone || '-'}</p>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">Room {roomNumber}</span>
              </div>
          </div>

          <div className="space-y-3">
              <button onClick={() => setShowDigitalId(true)} className="w-full bg-card p-4 rounded-2xl border border-border flex justify-between items-center text-foreground hover:bg-muted/50 transition-colors shadow-sm group">
                  <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <Shield size={20} />
                      </div>
                      <span className="font-bold text-sm">Digital ID Card</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
              </button>

              <button className="w-full bg-card p-4 rounded-2xl border border-border flex justify-between items-center text-foreground hover:bg-muted/50 transition-colors shadow-sm group">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-sm">สัญญาเช่า</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
              </button>

              <button className="w-full bg-card p-4 rounded-2xl border border-border flex justify-between items-center text-foreground hover:bg-muted/50 transition-colors shadow-sm group">
                  <div className="flex items-center gap-3">
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <History size={20} />
                      </div>
                      <span className="font-bold text-sm">ประวัติพัสดุ ({parcelHistory.length})</span>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
              </button>
          </div>

          <div className="pt-4">
             <button 
                onClick={onLogout}
                className="w-full bg-destructive/10 text-destructive py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
             >
                 <LogOut size={18} /> ออกจากระบบ
             </button>
             <p className="text-center text-[10px] text-muted-foreground mt-4 opacity-60">
                 NexDorm v2.5 (Tenant)
             </p>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
        {showDigitalId && <DigitalIdCard />}

        {/* Content Area */}
        <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-background overflow-hidden">
            {activeTab === 'HOME' && renderHome()}
            {activeTab === 'BILL' && renderBill()}
            {activeTab === 'REPAIR' && renderRepair()}
            {activeTab === 'PROFILE' && renderProfile()}

            {/* Floating Bottom Navigation Bar */}
            <div className="fixed bottom-6 left-6 right-6 bg-card/90 backdrop-blur-xl border border-white/20 px-6 py-3.5 flex justify-between items-center z-40 md:max-w-[calc(28rem-3rem)] md:mx-auto rounded-2xl shadow-2xl ring-1 ring-black/5">
                <button 
                    onClick={() => setActiveTab('HOME')}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'HOME' ? 'text-primary -translate-y-1' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Home size={24} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} className={activeTab === 'HOME' ? 'drop-shadow-md' : ''} />
                    <span className={`text-[10px] font-bold ${activeTab === 'HOME' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Home</span>
                </button>
                <button 
                    onClick={() => setActiveTab('BILL')}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'BILL' ? 'text-primary -translate-y-1' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <FileText size={24} strokeWidth={activeTab === 'BILL' ? 2.5 : 2} className={activeTab === 'BILL' ? 'drop-shadow-md' : ''} />
                    <span className={`text-[10px] font-bold ${activeTab === 'BILL' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Bills</span>
                </button>
                <div className="w-px h-8 bg-border mx-1"></div>
                <button 
                    onClick={() => setActiveTab('REPAIR')}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'REPAIR' ? 'text-primary -translate-y-1' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Wrench size={24} strokeWidth={activeTab === 'REPAIR' ? 2.5 : 2} className={activeTab === 'REPAIR' ? 'drop-shadow-md' : ''} />
                    <span className={`text-[10px] font-bold ${activeTab === 'REPAIR' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Fix</span>
                </button>
                <button 
                    onClick={() => setActiveTab('PROFILE')}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'PROFILE' ? 'text-primary -translate-y-1' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <User size={24} strokeWidth={activeTab === 'PROFILE' ? 2.5 : 2} className={activeTab === 'PROFILE' ? 'drop-shadow-md' : ''} />
                    <span className={`text-[10px] font-bold ${activeTab === 'PROFILE' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>Me</span>
                </button>
            </div>
        </div>
    </div>
  );
}
