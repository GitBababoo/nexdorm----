
import { createClient } from '@supabase/supabase-js';
import { Room, Parcel, MaintenanceRequest, Invoice, AppSettings, User } from '../types';

// Using provided credentials
const supabaseUrl = 'https://jqnwveqgywrgdwbhgwit.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxbnd2ZXFneXdyZ2R3Ymhnd2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjEyMzgsImV4cCI6MjA3OTEzNzIzOH0.aLrQykEPh_rYQlhNN9zT43VaLpA__SgvnH6G578AooU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- API METHODS ---

export const api = {
  // AUTH & USERS
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        console.error("Login query error:", error.message);
        return null;
      }
      
      if (!data) {
        console.warn("Login failed: User not found");
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email,
        roomId: data.room_id
      };
    } catch (e: any) {
      console.error("Login exception:", e.message || e);
      return null;
    }
  },

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data.map((u: any) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      firstName: u.first_name,
      lastName: u.last_name,
      phone: u.phone,
      email: u.email,
      roomId: u.room_id
    }));
  },

  createUser: async (user: Omit<User, 'id'> & { password: string }) => {
    // Note: In a real production environment with Supabase Auth, 
    // you would use supabase.auth.signUp() or an Admin API to create users.
    // Since we are using a custom 'users' table as per instruction:
    
    const { data, error } = await supabase.from('users').insert({
      username: user.username,
      password: user.password, // Storing plain text as per request requirements (Not recommended for Prod)
      role: user.role,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      email: user.email,
      // room_id is usually assigned via RoomManagement check-in, initially null
    }).select().single();

    if (error) throw error;
    
    return {
      id: data.id,
      username: data.username,
      role: data.role,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      email: data.email,
      roomId: data.room_id
    } as User;
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return true;
  },

  // ROOMS
  getRooms: async () => {
    try {
      // Fetch rooms and join with current_tenant (users table)
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          current_tenant:users!current_tenant_id(
            id, first_name, last_name, phone, email
          )
        `)
        .order('number', { ascending: true });
        
      if (error) {
          console.error("GetRooms Error:", error.message);
          return [];
      }
      
      // Map DB response to frontend Room interface
      return data.map((r: any) => ({
        id: r.id,
        number: r.number,
        floor: r.floor,
        price: r.price,
        status: r.status,
        lastMeterWater: r.last_meter_water,
        lastMeterElec: r.last_meter_elec,
        history: [], 
        currentTenant: r.current_tenant ? {
            id: r.current_tenant.id,
            name: `${r.current_tenant.first_name} ${r.current_tenant.last_name}`,
            phone: r.current_tenant.phone,
            email: r.current_tenant.email,
            leaseStart: r.lease_start || '',
            leaseEnd: r.lease_end || ''
        } : undefined
      })) as Room[];
    } catch (e: any) {
      console.error("Error fetching rooms:", e.message || e);
      return [];
    }
  },
  updateRoom: async (room: Room) => {
    const { data, error } = await supabase.from('rooms').upsert({
        id: room.id,
        number: room.number,
        floor: room.floor,
        price: room.price,
        status: room.status,
        last_meter_water: room.lastMeterWater,
        last_meter_elec: room.lastMeterElec,
    }).select();
    if (error) throw error;
    return room; 
  },

  // PARCELS
  getParcels: async () => {
    const { data, error } = await supabase.from('parcels').select('*').order('arrived_at', { ascending: false });
    if (error) return [];
    return data.map((p: any) => ({
        id: p.id,
        roomNumber: p.room_number,
        recipientName: p.recipient_name,
        carrier: p.carrier,
        status: p.status,
        arrivedAt: new Date(p.arrived_at).toLocaleString('th-TH'),
        collectedAt: p.collected_at ? new Date(p.collected_at).toLocaleString('th-TH') : undefined
    })) as Parcel[];
  },
  createParcel: async (parcel: Parcel) => {
    const { data, error } = await supabase.from('parcels').insert({
        room_number: parcel.roomNumber,
        recipient_name: parcel.recipientName,
        carrier: parcel.carrier,
        status: parcel.status,
        arrived_at: new Date().toISOString()
    }).select();
    if (error) throw error;
    return { ...parcel, id: data[0].id };
  },
  updateParcel: async (parcel: Parcel) => {
    const { data, error } = await supabase.from('parcels').update({
        status: parcel.status,
        collected_at: parcel.status === 'COLLECTED' ? new Date().toISOString() : null
    }).eq('id', parcel.id).select();
    if (error) throw error;
    return parcel;
  },

  // MAINTENANCE
  getMaintenance: async () => {
    const { data, error } = await supabase.from('maintenance').select('*').order('reported_at', { ascending: false });
    if (error) return [];
    return data.map((m: any) => ({
        id: m.id,
        roomId: m.room_id,
        description: m.description,
        category: m.category,
        priority: m.priority,
        status: m.status,
        reportedAt: m.reported_at,
        aiAnalysis: m.ai_analysis
    })) as MaintenanceRequest[];
  },
  createMaintenance: async (req: MaintenanceRequest) => {
    const { data, error } = await supabase.from('maintenance').insert({
        room_id: req.roomId,
        description: req.description,
        category: req.category,
        priority: req.priority,
        status: req.status,
        reported_at: req.reportedAt,
        ai_analysis: req.aiAnalysis
    }).select();
    if (error) throw error;
    return { ...req, id: data[0].id };
  },
  updateMaintenance: async (req: MaintenanceRequest) => {
    const { data, error } = await supabase.from('maintenance').update({
        status: req.status
    }).eq('id', req.id).select();
    if (error) throw error;
    return req;
  },

  // INVOICES
  getInvoices: async () => {
    const { data, error } = await supabase.from('invoices').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    if (error) return [];
    return data.map((i: any) => ({
        id: i.id,
        roomId: i.room_id,
        roomNumber: i.room_number,
        month: i.month,
        year: i.year,
        prevWater: i.prev_water,
        currWater: i.curr_water,
        prevElec: i.prev_elec,
        currElec: i.curr_elec,
        waterUnit: i.water_unit,
        elecUnit: i.elec_unit,
        waterPrice: i.water_price,
        elecPrice: i.elec_price,
        rentPrice: i.rent_price,
        total: i.total,
        isPaid: i.is_paid,
        dueDate: i.due_date
    })) as Invoice[];
  },
  createInvoice: async (inv: Invoice) => {
    const { data, error } = await supabase.from('invoices').insert({
        room_id: inv.roomId,
        room_number: inv.roomNumber,
        month: inv.month,
        year: inv.year,
        prev_water: inv.prevWater,
        curr_water: inv.currWater,
        prev_elec: inv.prevElec,
        curr_elec: inv.currElec,
        water_unit: inv.waterUnit,
        elec_unit: inv.elecUnit,
        water_price: inv.waterPrice,
        elec_price: inv.elecPrice,
        rent_price: inv.rentPrice,
        total: inv.total,
        is_paid: inv.isPaid,
        due_date: inv.dueDate
    }).select();
    if (error) throw error;
    return { ...inv, id: data[0].id };
  },
  updateInvoice: async (inv: Invoice) => {
    const { data, error } = await supabase.from('invoices').update({
        curr_water: inv.currWater,
        curr_elec: inv.currElec,
        water_unit: inv.waterUnit,
        elec_unit: inv.elecUnit,
        water_price: inv.waterPrice,
        elec_price: inv.elecPrice,
        total: inv.total,
        is_paid: inv.isPaid
    }).eq('id', inv.id).select();
    if (error) throw error;
    return inv;
  },

  // SETTINGS
  getSettings: async () => {
    try {
        const { data, error } = await supabase.from('settings').select('*').single();
        if (error) return null;
        return {
            dormName: data.dorm_name,
            waterRate: data.water_rate,
            elecRate: data.elec_rate,
            commonFee: data.common_fee,
            theme: data.theme,
            darkMode: data.dark_mode
        } as AppSettings;
    } catch (e) {
        return null;
    }
  },
  updateSettings: async (settings: AppSettings) => {
    const { data, error } = await supabase.from('settings').upsert({ 
        id: 1, 
        dorm_name: settings.dormName,
        water_rate: settings.waterRate,
        elec_rate: settings.elecRate,
        common_fee: settings.commonFee,
        theme: settings.theme,
        dark_mode: settings.darkMode
    }).select();
    if (error) throw error;
    return settings;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('settings').select('id').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
};
