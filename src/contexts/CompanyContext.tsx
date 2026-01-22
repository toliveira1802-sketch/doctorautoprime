import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Empresa } from '@/types/database'

interface CompanyContextType {
    companies: Empresa[]
    selectedCompany: Empresa | null
    isLoading: boolean
    selectCompany: (companyId: string) => void
    selectAllCompanies: () => void
    isAllCompaniesView: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

// Mock companies for development without Supabase
const mockCompanies: Empresa[] = [
    {
        id: '1',
        name: 'Doctor Auto Prime',
        slug: 'doctor-auto-prime',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Doctor Auto Bosch',
        slug: 'doctor-auto-bosch',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '3',
        name: 'Garage 347',
        slug: 'garage-347',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
]

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [companies, setCompanies] = useState<Empresa[]>([])
    const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAllCompaniesView, setIsAllCompaniesView] = useState(false)

    const useMock = !import.meta.env.VITE_SUPABASE_URL

    useEffect(() => {
        const loadCompanies = async () => {
            if (useMock) {
                // Use mock data
                setCompanies(mockCompanies)
                // Load saved selection from localStorage
                const savedCompanyId = localStorage.getItem('selected_company_id')
                const savedIsAll = localStorage.getItem('is_all_companies_view') === 'true'
                
                if (savedIsAll) {
                    setIsAllCompaniesView(true)
                    setSelectedCompany(null)
                } else if (savedCompanyId) {
                    const company = mockCompanies.find(c => c.id === savedCompanyId)
                    setSelectedCompany(company || mockCompanies[0])
                } else {
                    setSelectedCompany(mockCompanies[0])
                }
                setIsLoading(false)
                return
            }

            // Load from Supabase
            try {
                const { data, error } = await supabase
                    .from('empresas')
                    .select('*')
                    .eq('ativo', true)
                    .order('name')

                if (error) throw error

                setCompanies(data || [])
                
                // Load saved selection from localStorage
                const savedCompanyId = localStorage.getItem('selected_company_id')
                const savedIsAll = localStorage.getItem('is_all_companies_view') === 'true'
                
                if (savedIsAll) {
                    setIsAllCompaniesView(true)
                    setSelectedCompany(null)
                } else if (savedCompanyId && data) {
                    const company = data.find(c => c.id === savedCompanyId)
                    setSelectedCompany(company || data[0])
                } else if (data && data.length > 0) {
                    setSelectedCompany(data[0])
                }
            } catch (error) {
                console.error('Error loading companies:', error)
                // Fallback to mock data on error
                setCompanies(mockCompanies)
                setSelectedCompany(mockCompanies[0])
            } finally {
                setIsLoading(false)
            }
        }

        loadCompanies()
    }, [useMock])

    const selectCompany = (companyId: string) => {
        const company = companies.find(c => c.id === companyId)
        if (company) {
            setSelectedCompany(company)
            setIsAllCompaniesView(false)
            localStorage.setItem('selected_company_id', companyId)
            localStorage.setItem('is_all_companies_view', 'false')
        }
    }

    const selectAllCompanies = () => {
        setSelectedCompany(null)
        setIsAllCompaniesView(true)
        localStorage.removeItem('selected_company_id')
        localStorage.setItem('is_all_companies_view', 'true')
    }

    return (
        <CompanyContext.Provider
            value={{
                companies,
                selectedCompany,
                isLoading,
                selectCompany,
                selectAllCompanies,
                isAllCompaniesView,
            }}
        >
            {children}
        </CompanyContext.Provider>
    )
}

export function useCompany() {
    const context = useContext(CompanyContext)
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider')
    }
    return context
}
