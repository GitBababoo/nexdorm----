
import React, { useState } from 'react';
import { Wrench, Check, Sparkles, Plus } from 'lucide-react';
import { analyzeMaintenanceRequest } from '../services/geminiService';
import { MaintenanceRequest, MaintenanceStatus } from '../types';

interface MaintenanceProps {
  requests: MaintenanceRequest[];
  onAddRequest: (req: MaintenanceRequest) => void;
  onUpdateRequest: (req: MaintenanceRequest) => void;
}

export default function Maintenance({ requests, onAddRequest, onUpdateRequest }: MaintenanceProps) {
  const [newDesc, setNewDesc] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // Call Gemini AI
    const analysis = await analyzeMaintenanceRequest(newDesc);

    const newRequest: MaintenanceRequest = {
      id: `m-${Date.now()}`,
      roomId: `manual-${newRoom}`, // In a real app, we'd look up ID
      description: newDesc,
      priority: analysis.priority as 'LOW'|'MEDIUM'|'HIGH',
      category: analysis.category,
      aiAnalysis: analysis.advice,
      status: MaintenanceStatus.PENDING,
      reportedAt: new Date().toISOString().split('T')[0]
    };

    onAddRequest(newRequest);
    setNewDesc('');
    setNewRoom('');
    setIsAnalyzing(false);
    setShowForm(false);
  };

  const updateStatus = (req: MaintenanceRequest, newStatus: MaintenanceStatus) => {
      onUpdateRequest({ ...req, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">แจ้งซ่อม & บำรุงรักษา</h2>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
            <Plus size={18} /> แจ้งซ่อมใหม่
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-6 animate-in slide-in-from-top-4 fade-in">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={20} /> AI Smart Report
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                        type="text" 
                        placeholder="เลขห้อง" 
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        className="border-slate-200 border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="อาการเสีย (เช่น แอร์ไม่เย็น, ไฟดับ)" 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="md:col-span-3 border-slate-200 border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                </div>
                <button 
                    disabled={isAnalyzing}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-all flex justify-center items-center"
                >
                    {isAnalyzing ? (
                        <> <Sparkles className="animate-pulse mr-2" /> กำลังวิเคราะห์ด้วย AI... </>
                    ) : 'ส่งแจ้งซ่อม'}
                </button>
            </form>
        </div>
      )}

      <div className="grid gap-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${req.status === MaintenanceStatus.COMPLETED ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {req.status === MaintenanceStatus.COMPLETED ? <Check size={24} /> : <Wrench size={24} />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-slate-800">
                            {req.roomId.startsWith('r-') || req.roomId.startsWith('manual-') ? 
                                (req.roomId.startsWith('manual-') ? `ห้อง ${req.roomId.replace('manual-', '')}` : 
                                `ห้อง ${parseInt(req.roomId.replace('r-','')) + 101}`) 
                            : `Ticket #${req.id}`}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            req.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 
                            req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {req.priority} PRIORITY
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{req.category}</span>
                    </div>
                    <p className="text-slate-600">{req.description}</p>
                    {req.aiAnalysis && (
                        <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg flex items-start gap-2">
                            <Sparkles size={12} className="mt-0.5 shrink-0" />
                            <span>AI Advice: {req.aiAnalysis}</span>
                        </div>
                    )}
                </div>
             </div>
             
             <div className="flex items-center gap-2 w-full md:w-auto">
                {req.status === MaintenanceStatus.PENDING && (
                    <button 
                        onClick={() => updateStatus(req, MaintenanceStatus.COMPLETED)}
                        className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                    >
                        ปิดงานซ่อม
                    </button>
                )}
                {req.status === MaintenanceStatus.COMPLETED && (
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        เรียบร้อย
                    </span>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
