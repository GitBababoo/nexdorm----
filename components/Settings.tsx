
import React from 'react';
import { Settings as SettingsIcon, Save, DollarSign, Building, Palette, Check, Moon, Sun, Type } from 'lucide-react';
import { AppSettings } from '../types';
import { THEMES } from '../lib/themes';

interface SettingsProps {
    settings: AppSettings;
    onUpdate: (newSettings: AppSettings) => void;
    onThemeChange?: (themeId: string) => void;
    onToggleDarkMode?: (isDark: boolean) => void;
}

export default function Settings({ settings, onUpdate, onThemeChange, onToggleDarkMode }: SettingsProps) {
  const handleChange = (field: keyof AppSettings, value: string | number | boolean) => {
      onUpdate({ ...settings, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-end justify-between">
            <div>
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary"><SettingsIcon size={32} /></div>
                    Settings
                </h2>
                <p className="text-muted-foreground mt-2 text-lg">Customize your dormitory management system</p>
            </div>
        </div>

        {/* Visual Settings */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Palette className="text-primary" /> Visual & Theme
                </h3>
                <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-full border border-border">
                    <button 
                        onClick={() => onToggleDarkMode && onToggleDarkMode(false)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${!settings.darkMode ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Sun size={16} /> Light
                    </button>
                    <button 
                        onClick={() => onToggleDarkMode && onToggleDarkMode(true)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${settings.darkMode ? 'bg-slate-900 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Moon size={16} /> Dark
                    </button>
                </div>
            </div>
            
            <div className="p-8 bg-muted/20">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Select Theme Preset</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {THEMES.map((theme) => {
                        const isActive = settings.theme === theme.id || (!settings.theme && theme.id === 'theme-1');
                        // Use light mode colors for preview consistency unless dark mode is globally active
                        const colors = settings.darkMode ? theme.cssVars.dark : theme.cssVars.light;
                        
                        return (
                            <button
                                key={theme.id}
                                onClick={() => onThemeChange && onThemeChange(theme.id)}
                                className={`group relative flex flex-col text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                                    isActive 
                                    ? 'border-primary ring-4 ring-primary/10 scale-[1.02] shadow-xl' 
                                    : 'border-border hover:border-primary/50 hover:shadow-lg bg-card'
                                }`}
                            >
                                {/* Theme Preview Area */}
                                <div className="h-32 w-full relative" style={{ background: colors['--background'] }}>
                                    <div className="absolute top-4 left-4 right-4 bottom-0 bg-card rounded-t-xl shadow-lg border-t border-l border-r border-border p-3">
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-8 h-2 rounded-full" style={{ background: colors['--primary'] }}></div>
                                            <div className="w-4 h-2 rounded-full" style={{ background: colors['--secondary'] }}></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-full h-2 rounded-full bg-muted"></div>
                                            <div className="w-2/3 h-2 rounded-full bg-muted"></div>
                                        </div>
                                        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: colors['--primary'] }}>
                                            <Check size={14} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-card flex justify-between items-center border-t border-border">
                                    <div>
                                        <span className={`font-bold block ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                            {theme.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Type size={10} /> {theme.fontFamily.split(',')[0].replace(/'/g, '')}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg shadow-primary/40 animate-in zoom-in">
                                            <Check size={14} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* General Settings */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Building className="text-primary" /> General Information
                </h3>
            </div>
            <div className="p-8 grid gap-6">
                <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Dormitory Name</label>
                    <input 
                        type="text" 
                        value={settings.dormName}
                        onChange={(e) => handleChange('dormName', e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary outline-none text-foreground font-medium transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Utility Rates */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
             <div className="p-8 border-b border-border">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="text-emerald-500" /> Utility Rates & Fees
                </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-muted-foreground">Water Rate (per unit)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={settings.waterRate}
                            onChange={(e) => handleChange('waterRate', Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-5 py-3 pl-12 focus:ring-2 focus:ring-primary outline-none text-foreground font-bold text-lg"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-muted-foreground">Electricity Rate (per unit)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={settings.elecRate}
                            onChange={(e) => handleChange('elecRate', Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-5 py-3 pl-12 focus:ring-2 focus:ring-primary outline-none text-foreground font-bold text-lg"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-muted-foreground">Common Fee (Monthly)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={settings.commonFee}
                            onChange={(e) => handleChange('commonFee', Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-5 py-3 pl-12 focus:ring-2 focus:ring-primary outline-none text-foreground font-bold text-lg"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">฿</span>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-muted/30 flex justify-end border-t border-border">
                <button 
                    onClick={() => onUpdate(settings)}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/25 transform active:scale-95"
                >
                    <Save size={20} /> Save Changes
                </button>
            </div>
        </div>
    </div>
  );
}
