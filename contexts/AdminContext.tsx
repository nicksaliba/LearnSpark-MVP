// contexts/AdminContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AdminContextType {
  selectedSchool: string | null
  setSelectedSchool: (schoolId: string | null) => void
  selectedDistrict: string | null
  setSelectedDistrict: (districtId: string | null) => void
  dateRange: { start: Date; end: Date }
  setDateRange: (range: { start: Date; end: Date }) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  })
  
  return (
    <AdminContext.Provider value={{
      selectedSchool,
      setSelectedSchool,
      selectedDistrict,
      setSelectedDistrict,
      dateRange,
      setDateRange
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminContext() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider')
  }
  return context
}