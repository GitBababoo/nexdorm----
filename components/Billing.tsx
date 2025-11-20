
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Printer, Send, Download, Edit3, Save, RotateCcw, Zap, Droplets, Cpu, Camera, Loader2, PlusCircle, FileText } from 'lucide-react';
import { Room, Invoice, AppSettings } from '../types';
import { readMeterImage } from '../services/geminiService';

interface BillingProps {
    rooms: Room[];
    settings: AppSettings;
    invoices: Invoice[];
    onUpdateInvoice: (invoice: Invoice) => void;
    onGenerateInvoices: (invoices: Invoice[]) => void;
}

const InvoiceModal = ({ invoice, onClose, settings, onPay }: { invoice: Invoice; onClose: () => void; settings: AppSettings; onPay: () => void }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <h3 className="text-xl font-bold">ใบแจ้งหนี้ (Invoice)</h3>
          <p className="opacity-80 text-sm">งวดประจำเดือน {invoice.month} {invoice.year}</p>
          <p className="text-xs mt-1 font-medium bg-white/20 inline-block px-2 py-0.5 rounded">{settings.dormName}</p>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-1">✕</button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center">
             <p className="text-slate-500 text-sm">ยอดชำระรวม</p>
             <p className="text-4xl font-bold text-slate-800">฿{invoice.total.toLocaleString()}</p>
             <p className="text-xs text-red-500 mt-1">ครบกำหนด: {invoice.dueDate}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm">
            <div className="flex justify-between">
               <span className="text-slate-500">ค่าเช่าห้อง ({invoice.roomNumber})</span>
               <span className="font-medium">฿{invoice.rentPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-slate-500">ค่าน้ำ ({invoice.waterUnit} หน่วย x {settings.waterRate})</span>
               <span className="font-medium">฿{invoice.waterPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-slate-500">ค่าไฟ ({invoice.elecUnit} หน่วย x {settings.elecRate})</span>
               <span className="font-medium">฿{invoice.elecPrice.toLocaleString()}</span>
            </div>
             <div className="flex justify-between text-slate-400 italic">
               <span>ค่าส่วนกลาง</span>
               <span>฿{settings.commonFee}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-700">
               <span>รวมทั้งสิ้น</span>
               <span>฿{invoice.total.toLocaleString()}</span>
            </div>
          </div>

          {!invoice.isPaid ? (
            <button 
                onClick={onPay}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
                ระบุว่ารับชำระเงินแล้ว (Mark Paid)
            </button>
          ) : (
            <div className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-bold text-center border border-green-200">
                ชำระเงินแล้ว (Paid)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Billing({ rooms, settings, invoices, onUpdateInvoice, onGenerateInvoices }: BillingProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [meterReadings, setMeterReadings] = useState<any>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMonth, setViewMonth] = useState<string>('กุมภาพันธ์');
  const [viewYear, setViewYear] = useState<number>(2025);
  
  // AI Vision State
  const [visionLoading, setVisionLoading] = useState<{id: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVisionTask, setActiveVisionTask] = useState<{id: string, type: 'currWater' | 'currElec'} | null>(null);

  // Filter invoices by view criteria
  const currentInvoices = invoices.filter(i => i.month === viewMonth && i.year === viewYear);

  // Initialize editing state when invoices change or mode changes
  useEffect(() => {
    const initialReadings: any = {};
    currentInvoices.forEach((inv) => {
        initialReadings[inv.id] = {
            currWater: inv.currWater,
            currElec: inv.currElec
        };
    });
    setMeterReadings(initialReadings);
  }, [invoices, viewMonth, viewYear]);

  const handleGenerateClick = () => {
    const newInvoices: Invoice[] = rooms
        .filter(r => r.status === 'OCCUPIED')
        .map((r) => {
            return {
                id: `inv-${r.id}-${viewMonth}-${viewYear}`,
                roomId: r.id,
                roomNumber: r.number,
                month: viewMonth,
                year: viewYear,
                prevWater: r.lastMeterWater,
                currWater: r.lastMeterWater, // Start same as prev
                prevElec: r.lastMeterElec,
                currElec: r.lastMeterElec, // Start same as prev
                waterUnit: 0,
                elecUnit: 0,
                waterPrice: 0,
                elecPrice: 0,
                rentPrice: r.price,
                total: r.price + settings.commonFee,
                isPaid: false,
                dueDate: `05/${viewMonth === 'กุมภาพันธ์' ? '02' : '03'}/${viewYear}`
            };
        });
    
    onGenerateInvoices(newInvoices);
  };

  const handleReadingChange = (id: string, type: 'currWater' | 'currElec', value: string) => {
    setMeterReadings((prev: any) => ({
        ...prev,
        [id]: {
            ...prev[id],
            [type]: Number(value)
        }
    }));
  };

  const saveReadings = () => {
    currentInvoices.forEach(inv => {
        const readings = meterReadings[inv.id];
        if (!readings) return;

        const waterUnit = Math.max(0, readings.currWater - inv.prevWater);
        const elecUnit = Math.max(0, readings.currElec - inv.prevElec);
        const waterPrice = waterUnit * settings.waterRate;
        const elecPrice = elecUnit * settings.elecRate;

        const updated: Invoice = {
            ...inv,
            currWater: readings.currWater,
            currElec: readings.currElec,
            waterUnit,
            elecUnit,
            waterPrice,
            elecPrice,
            total: inv.rentPrice + waterPrice + elecPrice + settings.commonFee
        };
        onUpdateInvoice(updated);
    });
    setEditMode(false);
  };

  const markAsPaid = (inv: Invoice) => {
      onUpdateInvoice({ ...inv, isPaid: true });
      setSelectedInvoice(null);
  };

  const simulateSmartMeterSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setMeterReadings((prev: any) => {
            const newReadings: any = { ...prev };
            currentInvoices.forEach(inv => {
                const randomWaterUsage = Math.floor(Math.random() * 20) + 5; 
                const randomElecUsage = Math.floor(Math.random() * 200) + 50; 
                newReadings[inv.id] = {
                    currWater: inv.prevWater + randomWaterUsage,
                    currElec: inv.prevElec + randomElecUsage
                };
            });
            return newReadings;
        });
        setIsSyncing(false);
    }, 1500);
  };

  // AI Vision Handlers
  const triggerVision = (id: string, type: 'currWater' | 'currElec') => {
    setActiveVisionTask({ id, type });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeVisionTask) return;

    const { id, type } = activeVisionTask;
    setVisionLoading({ id, type });

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        // Call Gemini
        const result = await readMeterImage(base64String, type === 'currWater' ? 'WATER' : 'ELECTRIC');
        
        if (result !== null) {
            handleReadingChange(id, type, result.toString());
        } else {
            alert("AI could not read the meter. Please enter manually.");
        }
        setVisionLoading(null);
        setActiveVisionTask(null);
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {selectedInvoice && (
          <InvoiceModal 
            invoice={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)} 
            settings={settings} 
            onPay={() => markAsPaid(selectedInvoice)}
          />
      )}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
               <Cpu className="text-indigo-600" /> Smart Metering & Billing
            </h2>
            <p className="text-slate-500">จัดการบิลและจดมิเตอร์ประจำเดือน</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
             {/* Month Selector */}
             <select 
                value={viewMonth} 
                onChange={(e) => setViewMonth(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
             >
                 {['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน'].map(m => <option key={m} value={m}>{m}</option>)}
             </select>

             {currentInvoices.length === 0 && (
                 <button 
                    onClick={handleGenerateClick}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-md transition-all"
                 >
                     <PlusCircle size={18} /> สร้างบิลรอบเดือนนี้
                 </button>
             )}

            {editMode && currentInvoices.length > 0 && (
                <>
                    <button 
                        onClick={simulateSmartMeterSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                    >
                        {isSyncing ? <RotateCcw className="animate-spin" size={18} /> : <Cpu size={18} />}
                        {isSyncing ? 'Syncing IoT...' : 'Auto-Read Meters'}
                    </button>
                    <button 
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        onClick={saveReadings}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-emerald-200 transition-all"
                    >
                        <Save size={18} /> บันทึก & คำนวณ
                    </button>
                </>
            )}
            {!editMode && currentInvoices.length > 0 && (
                <button 
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all"
                >
                    <Edit3 size={18} /> จดมิเตอร์ / แก้ไข
                </button>
            )}
        </div>
      </div>

      {currentInvoices.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-4 opacity-30" />
              <h3 className="text-lg font-bold text-slate-600">ยังไม่มีบิลสำหรับเดือนนี้</h3>
              <p className="mb-6">กดปุ่ม "สร้างบิลรอบเดือนนี้" เพื่อเริ่มดำเนินการ</p>
              <button 
                onClick={handleGenerateClick}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
              >
                  สร้างบิล {viewMonth}
              </button>
          </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs">
                <tr>
                    <th className="px-4 py-4">ห้อง</th>
                    <th className="px-4 py-4">มิเตอร์น้ำ (เก่า/ใหม่)</th>
                    <th className="px-4 py-4">มิเตอร์ไฟ (เก่า/ใหม่)</th>
                    <th className="px-4 py-4 text-right">ยอดรวม</th>
                    <th className="px-4 py-4 text-center">สถานะ</th>
                    <th className="px-4 py-4 text-right">จัดการ</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {currentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-indigo-600 text-lg">{inv.roomNumber}</td>
                    
                    {/* Water Meter */}
                    <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-cyan-50 p-1.5 rounded text-cyan-600"><Droplets size={14}/></div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs w-8">{inv.prevWater}</span>
                                    <span className="text-slate-300">→</span>
                                    {editMode ? (
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                className="w-24 border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-right pr-8"
                                                value={meterReadings[inv.id]?.currWater}
                                                onChange={(e) => handleReadingChange(inv.id, 'currWater', e.target.value)}
                                            />
                                            <button 
                                                onClick={() => triggerVision(inv.id, 'currWater')}
                                                className="absolute right-1 top-1 text-slate-400 hover:text-indigo-600"
                                                title="Scan with AI Vision"
                                            >
                                                {visionLoading?.id === inv.id && visionLoading?.type === 'currWater' ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Camera size={14} />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-slate-700">{inv.currWater}</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-0.5">ใช้ไป {editMode ? (Math.max(0, meterReadings[inv.id]?.currWater - inv.prevWater)) : inv.waterUnit} หน่วย</span>
                            </div>
                        </div>
                    </td>

                    {/* Elec Meter */}
                    <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-amber-50 p-1.5 rounded text-amber-600"><Zap size={14}/></div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs w-8">{inv.prevElec}</span>
                                    <span className="text-slate-300">→</span>
                                    {editMode ? (
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                className="w-24 border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-right pr-8"
                                                value={meterReadings[inv.id]?.currElec}
                                                onChange={(e) => handleReadingChange(inv.id, 'currElec', e.target.value)}
                                            />
                                            <button 
                                                onClick={() => triggerVision(inv.id, 'currElec')}
                                                className="absolute right-1 top-1 text-slate-400 hover:text-indigo-600"
                                                title="Scan with AI Vision"
                                            >
                                                {visionLoading?.id === inv.id && visionLoading?.type === 'currElec' ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Camera size={14} />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-slate-700">{inv.currElec}</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-0.5">ใช้ไป {editMode ? (Math.max(0, meterReadings[inv.id]?.currElec - inv.prevElec)) : inv.elecUnit} หน่วย</span>
                            </div>
                        </div>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-800 text-right">
                        {editMode ? (
                            <span className="text-slate-400 italic text-xs">Calculating...</span>
                        ) : (
                            `฿${inv.total.toLocaleString()}`
                        )}
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {inv.isPaid ? 'ชำระแล้ว' : 'ค้างชำระ'}
                        </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                        <button 
                        onClick={() => setSelectedInvoice(inv)}
                        disabled={editMode}
                        className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30"
                        title="เปิดใบแจ้งหนี้"
                        >
                        <QrCode size={20} />
                        </button>
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
