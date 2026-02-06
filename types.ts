
export type Language = 'en' | 'hi';

export type UserRole = 'customer' | 'transporter' | 'admin';

export enum AppPanel {
  DASHBOARD = 'dashboard',
  GPS = 'gps',
  EMERGENCY = 'emergency',
  BILTY = 'bilty',
  BOOKING = 'booking',
  CALCULATOR = 'calculator',
  ADMIN = 'admin',
  PROFILE = 'profile'
}

export interface User {
  id?: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  businessName?: string;
  address?: string;
  bilty_linked?: boolean;
  bilty_token?: string;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  owner_id: string;
  type: string;
  status: 'Running' | 'Stopped' | 'Offline';
  speed: number;
  fuel_level: number;
  battery_level: number;
  ignition: boolean;
  lat: number;
  lng: number;
  last_updated: string;
  created_at?: string;
}

export interface VehicleActivity {
  total_km: number;
  idle_hours: number;
  overspeed_alerts: number;
  active_days: number;
}

export interface Sensor {
  id: string;
  name: string;
  price: string;
  features: string[];
  compatibility: string;
}

export interface Booking {
  id: string;
  driver: string;
  truck: string;
  rating: number;
  price: string;
  status: 'searching' | 'confirmed' | 'in_transit' | 'completed';
}

export interface EmergencyRequest {
  id: string;
  type: string;
  status: 'pending' | 'assigned' | 'tracking' | 'completed';
  eta: number;
  billAmount?: string;
}

export interface LoadEstimation {
  truckType: string;
  estimatedCost: number;
  fuelEstimate: number;
  tollEstimate: number;
  reasoning: string;
}
