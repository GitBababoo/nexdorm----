
import React, { useState } from 'react';
import { Package, CheckCircle, Box, Plus } from 'lucide-react';
import { Parcel } from '../types';
import { generateParcelNotification } from '../services/geminiService';

interface ParcelManagementProps {
  parcels: Parcel[];
  onAddParcel: (parcel: Parcel) => void;
  onUpdateParcel: (parcel: Parcel) => void;
}

export default function ParcelManagement({ parcels, onAddParcel, onUpdateParcel }: ParcelManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [newParcel, setNewParcel] = useState({ room: '', name: '', carrier: '' });
  const [notifyMsg, setNotifyMsg] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);

  const handleAdd = async () => {
    if (!newParcel.room || !newParcel.name) return;
    
    setIsNotifying(true);
    // Simulate AI generation
    const msg = await generateParcelNotification({ room: newParcel.room, carrier: newParcel.carrier, name: newParcel.name });
    setNotifyMsg(msg);

    const newItem: Parcel = {
        id: `p${Date.now()}`,
        roomNumber: newParcel.room,
        recipientName: newParcel.name,
        carrier: newParcel.carrier,
        arrivedAt: new Date().toLocaleString('th-TH'),
        status: 'WAITING'
    };
    
    onAddParcel(newItem);
    setNewParcel({ room: '', name: '', carrier: '' });
    setIsNotifying(false);
    setShowForm(false);
  };

  const markCollected = (id: string) => {
    const target = parcels.find(p => p.id === id);
    if (target) {
        onUpdateParcel({ 
            ...target, 
            status: 'COLLECTED', 
            collectedAt: new Date().toLocaleString('th-TH') 
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Package className="text-indigo-600" /> Parcel & Mailbox
            </h2>
            <p className="text-slate-500">จัดการพัสดุและแจ้งเตือนลูกบ้าน</p>
         </div>
         <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
         >
            <Plus size={18} /> รับพัสดุใหม่
         </button>
      </div>

      {notifyMsg && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex justify-between items-center animate-in slide-in-from-top-2">
              <div>
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">AI Notification Sent</p>
                  <p className="text-sm text-slate-700 italic">"{notifyMsg}"</p>
              </div>
              <button onClick={() => setNotifyMsg('')} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-800 mb-4">บันทึกพัสดุมาใหม่</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input 
                    type="text" 
                    placeholder="เลขห้อง (เช่น 101)" 
                    className="border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newParcel.room}
                    onChange={e => setNewParcel({...newParcel, room: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="ชื่อผู้รับ" 
                    className="border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newParcel.name}
                    onChange={e => setNewParcel({...newParcel, name: e.target.value})}
                />
                <select 
                    className="border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newParcel.carrier}
                    onChange={e => setNewParcel({...newParcel, carrier: e.target.value})}
                >
                    <option value="">เลือกขนส่ง...</option>
                    <option value="Kerry">Kerry Express</option>
                    <option value="Flash">Flash Express</option>
                    <option value="ThaiPost">ไปรษณีย์ไทย</option>
                    <option value="Lazada/Shopee">Lazada/Shopee</option>
                    <option value="Other">อื่นๆ</option>
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
                <button 
                    onClick={handleAdd}
                    disabled={!newParcel.room || isNotifying}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                >
                    {isNotifying ? 'กำลังสร้างแจ้งเตือน...' : 'บันทึก & แจ้งเตือน'}
                </button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                      <th className="px-6 py-4">ห้อง</th>
                      <th className="px-6 py-4">ผู้รับ</th>
                      <th className="px-6 py-4">ขนส่ง</th>
                      <th className="px-6 py-4">เวลามาถึง</th>
                      <th className="px-6 py-4">สถานะ</th>
                      <th className="px-6 py-4 text-right">ดำเนินการ</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {parcels.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-indigo-600">{p.roomNumber}</td>
                          <td className="px-6 py-4">{p.recipientName}</td>
                          <td className="px-6 py-4">
                              <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600 border border-slate-200">
                                  {p.carrier}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{p.arrivedAt}</td>
                          <td className="px-6 py-4">
                              {p.status === 'WAITING' ? (
                                  <span className="text-orange-500 font-bold text-xs flex items-center gap-1">
                                      <Box size={12} /> รอรับ
                                  </span>
                              ) : (
                                  <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                                      <CheckCircle size={12} /> รับแล้ว
                                  </span>
                              )}
                          </td>
                          <td className="px-6 py-4 text-right">
                              {p.status === 'WAITING' && (
                                  <button 
                                    onClick={() => markCollected(p.id)}
                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                  >
                                      ยืนยันการรับของ
                                  </button>
                              )}
                              {p.status === 'COLLECTED' && (
                                  <span className="text-xs text-slate-400">รับเมื่อ {p.collectedAt?.split(' ')[1]}</span>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}
