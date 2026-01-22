// Database types for Supabase
export type Database = {
    public: {
        Tables: {
            empresas: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    ativo: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    ativo?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    ativo?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    role: 'admin' | 'gestao' | 'user' | 'dev'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'gestao' | 'user' | 'dev'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    role?: 'admin' | 'gestao' | 'user' | 'dev'
                    created_at?: string
                    updated_at?: string
                }
            }
            vehicles: {
                Row: {
                    id: string
                    user_id: string
                    brand: string
                    model: string
                    year: number
                    plate: string
                    color: string | null
                    mileage: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    brand: string
                    model: string
                    year: number
                    plate: string
                    color?: string | null
                    mileage?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    brand?: string
                    model?: string
                    year?: number
                    plate?: string
                    color?: string | null
                    mileage?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    duration_minutes: number
                    category: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    duration_minutes: number
                    category: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    duration_minutes?: number
                    category?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    user_id: string
                    vehicle_id: string
                    service_id: string
                    scheduled_date: string
                    scheduled_time: string
                    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    vehicle_id: string
                    service_id: string
                    scheduled_date: string
                    scheduled_time: string
                    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    vehicle_id?: string
                    service_id?: string
                    scheduled_date?: string
                    scheduled_time?: string
                    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            service_orders: {
                Row: {
                    id: string
                    order_number: string
                    user_id: string
                    vehicle_id: string
                    status: 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled'
                    total: number
                    notes: string | null
                    created_at: string
                    updated_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    order_number?: string
                    user_id: string
                    vehicle_id: string
                    status?: 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled'
                    total?: number
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    order_number?: string
                    user_id?: string
                    vehicle_id?: string
                    status?: 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled'
                    total?: number
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                    completed_at?: string | null
                }
            }
            service_order_items: {
                Row: {
                    id: string
                    order_id: string
                    service_id: string | null
                    description: string
                    quantity: number
                    unit_price: number
                    total: number
                    type: 'service' | 'part'
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    service_id?: string | null
                    description: string
                    quantity?: number
                    unit_price: number
                    total?: number
                    type: 'service' | 'part'
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    service_id?: string | null
                    description?: string
                    quantity?: number
                    unit_price?: number
                    total?: number
                    type?: 'service' | 'part'
                    created_at?: string
                }
            }
            patio_vehicles: {
                Row: {
                    id: string
                    vehicle_id: string
                    order_id: string | null
                    status: 'waiting' | 'in_service' | 'ready' | 'delivered'
                    bay_number: number | null
                    entered_at: string
                    exited_at: string | null
                }
                Insert: {
                    id?: string
                    vehicle_id: string
                    order_id?: string | null
                    status?: 'waiting' | 'in_service' | 'ready' | 'delivered'
                    bay_number?: number | null
                    entered_at?: string
                    exited_at?: string | null
                }
                Update: {
                    id?: string
                    vehicle_id?: string
                    order_id?: string | null
                    status?: 'waiting' | 'in_service' | 'ready' | 'delivered'
                    bay_number?: number | null
                    entered_at?: string
                    exited_at?: string | null
                }
            }
        }
        Views: {}
        Functions: {}
        Enums: {
            app_role: 'admin' | 'gestao' | 'user' | 'dev'
            appointment_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
            order_status: 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'cancelled'
            patio_status: 'waiting' | 'in_service' | 'ready' | 'delivered'
        }
    }
}

// Convenience types
export type Empresa = Database['public']['Tables']['empresas']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type ServiceOrder = Database['public']['Tables']['service_orders']['Row']
export type ServiceOrderItem = Database['public']['Tables']['service_order_items']['Row']
export type PatioVehicle = Database['public']['Tables']['patio_vehicles']['Row']

export type AppRole = Database['public']['Enums']['app_role']
export type AppointmentStatus = Database['public']['Enums']['appointment_status']
export type OrderStatus = Database['public']['Enums']['order_status']
export type PatioStatus = Database['public']['Enums']['patio_status']
