export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'driver' | 'admin';
  status?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface FareActiveResponse {
  success: boolean;
  fare: {
    base_fare: number;
    price_per_km: number;
    price_per_minute: number;
    minimum_fare: number;
    surge_multiplier: number;
  };
}