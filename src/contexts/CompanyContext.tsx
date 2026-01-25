import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Empresa {
    id: string
    name: string
    slug: string
    ativo: boolean
    created_at: string
    updated_at: string
}

interface CompanyContextType {
    companies: Empresa[]
    selectedCompany: Empresa | null
    isLoading: boolean
    selectCompany: (companyId: string) => void
    selectAllCompanies: () => void
    isAllCompaniesView: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

// Mock companies for development
const mockCompanies: Empresa[] = [
    {
        id: '1',
        name: 'Doctor Auto Prime',
        slug: 'doctor-auto-prime',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
]

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [companies] = useState<Empresa[]>(mockCompanies)
    const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(mockCompanies[0])
    const [isLoading] = useState(false)
    const [isAllCompaniesView, setIsAllCompaniesView] = useState(false)

    const selectCompany = (companyId: string) => {
        const company = companies.find(c => c.id === companyId)
        if (company) {
            setSelectedCompany(company)
            setIsAllCompaniesView(false)
        }
    }

    const selectAllCompanies = () => {
        setSelectedCompany(null)
        setIsAllCompaniesView(true)
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
