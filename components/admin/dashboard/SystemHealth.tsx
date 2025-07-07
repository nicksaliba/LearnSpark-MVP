// components/admin/dashboard/SystemHealth.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useSystemHealth } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

export function SystemHealth() {
  const { health, isLoading } = useSystemHealth()
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  const services = [
    {
      name: 'API Server',
      status: health?.api?.status || 'unknown',
      uptime: health?.api?.uptime || '0%',
      responseTime: health?.api?.responseTime || '0ms',
      icon: Server
    },
    {
      name: 'Database',
      status: health?.database?.status || 'unknown',
      connections: health?.database?.connections || 0,
      size: health?.database?.size || '0GB',
      icon: Database
    },
    {
      name: 'Storage',
      status: health?.storage?.status || 'unknown',
      used: health?.storage?.used || '0GB',
      total: health?.storage?.total || '0GB',
      icon: HardDrive
    },
    {
      name: 'Background Jobs',
      status: health?.jobs?.status || 'unknown',
      queued: health?.jobs?.queued || 0,
      failed: health?.jobs?.failed || 0,
      icon: Cpu
    }
  ]
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle
      case 'warning':
      case 'error':
        return AlertTriangle
      default:
        return Activity
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          System Health
        </h2>
      </div>
      
      <div className="p-6 space-y-4">
        {services.map((service, index) => {
          const Icon = service.icon
          const StatusIcon = getStatusIcon(service.status)
          
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {service.name === 'API Server' && `Uptime: ${service.uptime}`}
                    {service.name === 'Database' && `${service.connections} connections`}
                    {service.name === 'Storage' && `${service.used} / ${service.total}`}
                    {service.name === 'Background Jobs' && `${service.queued} queued`}
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                getStatusColor(service.status)
              )}>
                <StatusIcon className="w-4 h-4" />
                {service.status}
              </div>
            </motion.div>
          )
        })}
        
        {/* System Alerts */}
        {health?.alerts && health.alerts.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">System Alerts</h4>
            {health.alerts.map((alert: any, index: number) => (
              <div key={index} className="text-sm text-yellow-700 mb-1">
                • {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}