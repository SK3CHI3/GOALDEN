'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  Download,
  Monitor,
  Zap
} from 'lucide-react'
import { 
  getSystemSettings, 
  updateSystemSettings, 
  getSystemHealth, 
  getUserRoles 
} from '@/app/actions/system'

interface SystemSettings {
  platform: {
    name: string
    version: string
    maintenance_mode: boolean
    registration_enabled: boolean
    tournaments_enabled: boolean
  }
  security: {
    password_min_length: number
    session_timeout: number
    two_factor_enabled: boolean
    ip_whitelist: string[]
  }
  notifications: {
    email_enabled: boolean
    sms_enabled: boolean
    push_enabled: boolean
    whatsapp_enabled: boolean
  }
  payments: {
    mpesa_enabled: boolean
    stripe_enabled: boolean
    minimum_amount: number
    maximum_amount: number
  }
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  response_time: number
  database_status: 'connected' | 'disconnected' | 'slow'
  storage_usage: number
  memory_usage: number
  cpu_usage: number
  active_users: number
  concurrent_tournaments: number
}

interface UserRole {
  id: string
  name: string
  permissions: string[]
  created_at: string
  user_count: number
}

export function SystemAdministration() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    async function loadSystemData() {
      try {
        // Load settings
        const settingsResult = await getSystemSettings()
        if (settingsResult.data) {
          setSettings(settingsResult.data as SystemSettings)
        }

        // Load health
        const healthResult = await getSystemHealth()
        if (healthResult.data) {
          setHealth(healthResult.data as SystemHealth)
        }

        // Load user roles
        const rolesResult = await getUserRoles()
        if (rolesResult.data) {
          setUserRoles(rolesResult.data as UserRole[])
        }

      } catch (error) {
        console.error('Error loading system data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSystemData()
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return
    
    try {
      const result = await updateSystemSettings(settings)
      if (result.error) {
        console.error('Error saving settings:', result.error)
        alert('Failed to save settings: ' + result.error)
        return
      }
    setShowSettings(false)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
  }

  const handleMaintenanceToggle = async () => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        platform: {
          ...settings.platform,
          maintenance_mode: !settings.platform.maintenance_mode
        }
      }
      setSettings(updatedSettings)
      
      // Save immediately
      try {
        const result = await updateSystemSettings(updatedSettings)
        if (result.error) {
          console.error('Error updating maintenance mode:', result.error)
          // Revert on error
          setSettings(settings)
          alert('Failed to update maintenance mode: ' + result.error)
        }
      } catch (error) {
        console.error('Error updating maintenance mode:', error)
        setSettings(settings)
        alert('Failed to update maintenance mode')
      }
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }


  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card border-none shadow-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="w-6 h-6" />
                </div>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tables Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="glass-card border-none shadow-premium">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-gray-600 mt-1">Manage system settings, security, and user roles</p>
        </div>
        <Button
          onClick={() => setShowSettings(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
        >
          <Settings className="h-4 w-4 mr-2" />
          System Settings
        </Button>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-gray-900">{health?.uptime}%</p>
              </div>
              <div className={`p-2 rounded-full ${getHealthColor(health?.status || 'healthy')}`}>
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{health?.response_time}ms</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{health?.active_users}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Usage</p>
                <p className="text-2xl font-bold text-gray-900">{health?.storage_usage}%</p>
              </div>
              <Database className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="glass-card border-none shadow-premium">
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'security' ? 'default' : 'outline'}
              onClick={() => setActiveTab('security')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              User Roles
            </Button>
            <Button
              variant={activeTab === 'monitoring' ? 'default' : 'outline'}
              onClick={() => setActiveTab('monitoring')}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Monitoring
            </Button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Platform Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Name:</span>
                      <span className="font-medium">{settings?.platform.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium">{settings?.platform.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maintenance Mode:</span>
                      <Badge className={settings?.platform.maintenance_mode ? 'bg-red-500' : 'bg-green-500'}>
                        {settings?.platform.maintenance_mode ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration:</span>
                      <Badge className={settings?.platform.registration_enabled ? 'bg-green-500' : 'bg-red-500'}>
                        {settings?.platform.registration_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">System Resources</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPU Usage:</span>
                      <span className="font-medium">{health?.cpu_usage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Memory Usage:</span>
                      <span className="font-medium">{health?.memory_usage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database Status:</span>
                      <Badge className={
                        health?.database_status === 'connected' ? 'bg-green-500' :
                        health?.database_status === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
                      }>
                        {health?.database_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Tournaments:</span>
                      <span className="font-medium">{health?.concurrent_tournaments}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleMaintenanceToggle}
                  className={settings?.platform.maintenance_mode ? 'bg-red-600' : 'bg-yellow-600'}
                >
                  {settings?.platform.maintenance_mode ? 'Disable Maintenance' : 'Enable Maintenance'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const healthResult = await getSystemHealth()
                      if (healthResult.data) {
                        setHealth(healthResult.data as SystemHealth)
                      }
                    } catch (error) {
                      console.error('Error refreshing system:', error)
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh System
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Security Settings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Password Min Length:</span>
                      <span className="font-medium">{settings?.security.password_min_length} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Timeout:</span>
                      <span className="font-medium">{settings?.security.session_timeout} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Two-Factor Auth:</span>
                      <Badge className={settings?.security.two_factor_enabled ? 'bg-green-500' : 'bg-red-500'}>
                        {settings?.security.two_factor_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">IP Whitelist</h3>
                  <div className="space-y-2">
                    {settings?.security.ip_whitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add IP
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Roles Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">User Roles & Permissions</h3>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              <div className="grid gap-4">
                {userRoles.map((role) => (
                  <div key={role.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{role.name}</h4>
                        <p className="text-sm text-gray-600">{role.user_count} users</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{health?.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">{health?.response_time}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users:</span>
                      <span className="font-medium">{health?.active_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Usage:</span>
                      <span className="font-medium">{health?.storage_usage}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">System Alerts</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">System Running Smoothly</span>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Storage Usage High (65%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      {showSettings && (
        <Card className="glass-card border-none shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Settings</span>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Platform Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Platform Name</label>
                    <Input 
                      value={settings?.platform.name || ''} 
                      onChange={(e) => settings && setSettings({
                        ...settings,
                        platform: { ...settings.platform, name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Version</label>
                    <Input 
                      value={settings?.platform.version || ''} 
                      onChange={(e) => settings && setSettings({
                        ...settings,
                        platform: { ...settings.platform, version: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Security Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Min Length</label>
                    <Input 
                      type="number" 
                      value={settings?.security.password_min_length || 8} 
                      onChange={(e) => settings && setSettings({
                        ...settings,
                        security: { ...settings.security, password_min_length: parseInt(e.target.value) || 8 }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session Timeout (hours)</label>
                    <Input 
                      type="number" 
                      value={settings?.security.session_timeout || 24} 
                      onChange={(e) => settings && setSettings({
                        ...settings,
                        security: { ...settings.security, session_timeout: parseInt(e.target.value) || 24 }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

