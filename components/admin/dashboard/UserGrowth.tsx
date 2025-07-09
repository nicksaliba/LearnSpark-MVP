// components/admin/dashboard/UserGrowth.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  Users,
  UserPlus,
  Activity,
  Calendar,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react'
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useAdminAnalytics } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

interface UserGrowthData {
  date: string
  newUsers: number
  totalUsers: number
  activeUsers: number
  students: number
  teachers: number
  admins: number
}

// Mock data - replace with real API data
const mockGrowthData: UserGrowthData[] = [
  { date: '2024-01-01', newUsers: 12, totalUsers: 450, activeUsers: 320, students: 8, teachers: 3, admins: 1 },
  { date: '2024-01-02', newUsers: 8, totalUsers: 458, activeUsers: 315, students: 6, teachers: 2, admins: 0 },
  { date: '2024-01-03', newUsers: 15, totalUsers: 473, activeUsers: 340, students: 12, teachers: 2, admins: 1 },
  { date: '2024-01-04', newUsers: 20, totalUsers: 493, activeUsers: 365, students: 18, teachers: 2, admins: 0 },
  { date: '2024-01-05', newUsers: 18, totalUsers: 511, activeUsers: 380, students: 15, teachers: 3, admins: 0 },
  { date: '2024-01-06', newUsers: 25, totalUsers: 536, activeUsers: 395, students: 22, teachers: 2, admins: 1 },
  { date: '2024-01-07', newUsers: 22, totalUsers: 558, activeUsers: 410, students: 18, teachers: 4, admins: 0 },
  { date: '2024-01-08', newUsers: 30, totalUsers: 588, activeUsers: 435, students: 25, teachers: 4, admins: 1 },
  { date: '2024-01-09', newUsers: 28, totalUsers: 616, activeUsers: 450, students: 24, teachers: 3, admins: 1 },
  { date: '2024-01-10', newUsers: 35, totalUsers: 651, activeUsers: 475, students: 30, teachers: 4, admins: 1 },
  { date: '2024-01-11', newUsers: 32, totalUsers: 683, activeUsers: 490, students: 28, teachers: 3, admins: 1 },
  { date: '2024-01-12', newUsers: 40, totalUsers: 723, activeUsers: 520, students: 35, teachers: 4, admins: 1 },
  { date: '2024-01-13', newUsers: 38, totalUsers: 761, activeUsers: 545, students: 33, teachers: 4, admins: 1 },
  { date: '2024-01-14', newUsers: 45, totalUsers: 806, activeUsers: 570, students: 40, teachers: 4, admins: 1 }
]

const roleDistributionData = [
  { name: 'Students', value: 720, color: '#8B5CF6' },
  { name: 'Teachers', value: 65, color: '#10B981' },
  { name: 'Admins', value: 21, color: '#F59E0B' }
]

type TimeRange = '7d' | '30d' | '90d' | '1y'
type ChartType = 'line' | 'area' | 'bar'

export function UserGrowth() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  // In production, this would use real data
  const { analytics, isLoading } = useAdminAnalytics({ range: timeRange })
  
  const growthData = mockGrowthData
  
  // Calculate metrics
  const totalUsers = growthData[growthData.length - 1]?.totalUsers || 0
  const previousTotal = growthData[growthData.length - 8]?.totalUsers || 0
  const growthRate = previousTotal > 0 ? ((totalUsers - previousTotal) / previousTotal * 100) : 0
  
  const avgNewUsers = growthData.reduce((sum, day) => sum + day.newUsers, 0) / growthData.length
  const totalNewUsers = growthData.reduce((sum, day) => sum + day.newUsers, 0)
  
  const avgActiveUsers = growthData.reduce((sum, day) => sum + day.activeUsers, 0) / growthData.length
  const engagementRate = totalUsers > 0 ? (avgActiveUsers / totalUsers * 100) : 0
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  
  const renderChart = () => {
    const commonProps = {
      data: growthData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="newUsers" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              name="New Users"
            />
            {showBreakdown && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Students"
                />
                <Line 
                  type="monotone" 
                  dataKey="teachers" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Teachers"
                />
              </>
            )}
          </LineChart>
        )
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="newUsers" fill="#8B5CF6" name="New Users" radius={[4, 4, 0, 0]} />
            {showBreakdown && (
              <Legend />
            )}
          </BarChart>
        )
        
      default: // area
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="newUsers" 
              stroke="#8B5CF6" 
              fill="#8B5CF6" 
              fillOpacity={0.1}
              strokeWidth={2}
              name="New Users"
            />
            {showBreakdown && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Students"
                />
                <Area 
                  type="monotone" 
                  dataKey="teachers" 
                  stroke="#F59E0B" 
                  fill="#F59E0B" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Teachers"
                />
              </>
            )}
          </AreaChart>
        )
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Growth</h2>
              <p className="text-sm text-gray-600">Registration and activity trends</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {/* Chart Type Selector */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="area">Area Chart</option>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
            
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                showBreakdown
                  ? "bg-purple-100 text-purple-700"
                  : "border border-gray-300 hover:bg-gray-50"
              )}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Breakdown
            </button>
            
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalUsers.toLocaleString()}
            </div>
            <div className={cn(
              "text-sm flex items-center gap-1",
              growthRate > 0 ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className="w-3 h-3" />
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">New Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalNewUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {avgNewUsers.toFixed(1)} avg/day
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(avgActiveUsers).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {engagementRate.toFixed(1)}% engagement
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Growth Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {growthRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              vs previous period
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Role Distribution (if breakdown is enabled) */}
      {showBreakdown && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {roleDistributionData.map((role, index) => (
                <motion.div
                  key={role.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="font-medium text-gray-900">{role.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {role.value.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}