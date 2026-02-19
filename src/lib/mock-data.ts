import { Profile, Vehicle, Service, Appointment, ServiceOrder, PatioVehicle } from '@/types/database'

// Mock Users
export const mockUsers: Profile[] = [
    {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'master@doctorautoprime.com',
        full_name: 'Master Admin',
        phone: '11999999999',
        avatar_url: null,
        role: 'dev',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'gestao@doctorautoprime.com',
        full_name: 'Carlos Silva',
        phone: '11999998888',
        avatar_url: null,
        role: 'gestao',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'admin@doctorautoprime.com',
        full_name: 'Pedro Admin',
        phone: '11999997777',
        avatar_url: null,
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'joao@email.com',
        full_name: 'João Santos',
        phone: '11988887777',
        avatar_url: null,
        role: 'user',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
    },
    {
        id: '00000000-0000-0000-0000-000000000004',
        email: 'maria@email.com',
        full_name: 'Maria Oliveira',
        phone: '11977776666',
        avatar_url: null,
        role: 'user',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z',
    },
]

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
    {
        id: 'v1',
        user_id: '00000000-0000-0000-0000-000000000003',
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        plate: 'ABC1D23',
        color: 'Preto',
        mileage: 35000,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
    },
    {
        id: 'v2',
        user_id: '00000000-0000-0000-0000-000000000003',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2021,
        plate: 'XYZ9E87',
        color: 'Branco',
        mileage: 42000,
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
    },
    {
        id: 'v3',
        user_id: '00000000-0000-0000-0000-000000000004',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2023,
        plate: 'MNO5F67',
        color: 'Cinza',
        mileage: 15000,
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z',
    },
]

// Mock Services
export const mockServices: Service[] = [
    {
        id: 's1',
        name: 'Troca de Óleo',
        description: 'Troca de óleo do motor com filtro',
        price: 150,
        duration_minutes: 30,
        category: 'Manutenção',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 's2',
        name: 'Alinhamento e Balanceamento',
        description: 'Alinhamento e balanceamento das 4 rodas',
        price: 120,
        duration_minutes: 45,
        category: 'Pneus',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 's3',
        name: 'Revisão Completa',
        description: 'Revisão de todos os sistemas do veículo',
        price: 350,
        duration_minutes: 120,
        category: 'Revisão',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 's4',
        name: 'Troca de Pastilhas de Freio',
        description: 'Substituição das pastilhas dianteiras ou traseiras',
        price: 200,
        duration_minutes: 60,
        category: 'Freios',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 's5',
        name: 'Diagnóstico Eletrônico',
        description: 'Leitura e diagnóstico da central eletrônica',
        price: 80,
        duration_minutes: 30,
        category: 'Diagnóstico',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
]

// Mock Appointments
export const mockAppointments: Appointment[] = [
    {
        id: 'a1',
        user_id: '00000000-0000-0000-0000-000000000003',
        vehicle_id: 'v1',
        service_id: 's1',
        scheduled_date: '2026-01-25',
        scheduled_time: '09:00',
        status: 'confirmed',
        notes: 'Usar óleo sintético',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
    },
    {
        id: 'a2',
        user_id: '00000000-0000-0000-0000-000000000003',
        vehicle_id: 'v2',
        service_id: 's3',
        scheduled_date: '2026-01-28',
        scheduled_time: '14:00',
        status: 'pending',
        notes: null,
        created_at: '2024-01-21T00:00:00Z',
        updated_at: '2024-01-21T00:00:00Z',
    },
    {
        id: 'a3',
        user_id: '00000000-0000-0000-0000-000000000004',
        vehicle_id: 'v3',
        service_id: 's2',
        scheduled_date: '2026-01-22',
        scheduled_time: '10:30',
        status: 'in_progress',
        notes: 'Cliente aguardando na loja',
        created_at: '2024-01-18T00:00:00Z',
        updated_at: '2024-01-22T00:00:00Z',
    },
]

// Mock Service Orders
export const mockServiceOrders: ServiceOrder[] = [
    {
        id: 'os1',
        order_number: 'OS-2026-0001',
        user_id: '00000000-0000-0000-0000-000000000003',
        vehicle_id: 'v1',
        status: 'in_progress',
        total: 450,
        notes: 'Cliente relatou barulho no motor',
        created_at: '2024-01-22T00:00:00Z',
        updated_at: '2024-01-22T00:00:00Z',
        completed_at: null,
    },
    {
        id: 'os2',
        order_number: 'OS-2026-0002',
        user_id: '00000000-0000-0000-0000-000000000004',
        vehicle_id: 'v3',
        status: 'waiting_approval',
        total: 1200,
        notes: 'Aguardando aprovação do orçamento',
        created_at: '2024-01-21T00:00:00Z',
        updated_at: '2024-01-22T00:00:00Z',
        completed_at: null,
    },
    {
        id: 'os3',
        order_number: 'OS-2026-0003',
        user_id: '00000000-0000-0000-0000-000000000003',
        vehicle_id: 'v2',
        status: 'completed',
        total: 320,
        notes: null,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-16T00:00:00Z',
        completed_at: '2024-01-16T12:00:00Z',
    },
]

// Mock Patio Vehicles
export const mockPatioVehicles: PatioVehicle[] = [
    {
        id: 'p1',
        vehicle_id: 'v1',
        order_id: 'os1',
        status: 'in_service',
        bay_number: 2,
        entered_at: '2024-01-22T08:00:00Z',
        exited_at: null,
    },
    {
        id: 'p2',
        vehicle_id: 'v3',
        order_id: 'os2',
        status: 'waiting',
        bay_number: null,
        entered_at: '2024-01-22T09:30:00Z',
        exited_at: null,
    },
]

// Helper functions
export function getVehicleById(id: string): Vehicle | undefined {
    return mockVehicles.find((v) => v.id === id)
}

export function getServiceById(id: string): Service | undefined {
    return mockServices.find((s) => s.id === id)
}

export function getUserById(id: string): Profile | undefined {
    return mockUsers.find((u) => u.id === id)
}

export function getVehiclesByUserId(userId: string): Vehicle[] {
    return mockVehicles.filter((v) => v.user_id === userId)
}

export function getAppointmentsByUserId(userId: string): Appointment[] {
    return mockAppointments.filter((a) => a.user_id === userId)
}

export function getServiceOrdersByUserId(userId: string): ServiceOrder[] {
    return mockServiceOrders.filter((o) => o.user_id === userId)
}
