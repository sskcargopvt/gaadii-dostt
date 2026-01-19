
export type Language = 'en' | 'hi';

export type UserRole = 'customer' | 'transporter' | 'admin';

export enum AppPanel {
  DASHBOARD = 'dashboard',
  GPS = 'gps',
  EMERGENCY = 'emergency',
  BILTY = 'bilty',
  BOOKING = 'booking',
  CALCULATOR = 'calculator',
  ADMIN = 'admin'
}

export interface User {
  id?: string;
  email: string;
  role: UserRole;
  name: string;
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
