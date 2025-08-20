'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Building
} from 'lucide-react'
import ClaimIntakeForm from '@/components/remediation/ClaimIntakeForm'
import DamageAssessmentGrid from '@/components/remediation/DamageAssessmentGrid'
import HVACAnalyzer from '@/components/remediation/HVACAnalyzer'
import RestorationCalculator from '@/components/remediation/RestorationCalculator'
import EvidenceUploader from '@/components/remediation/EvidenceUploader'
import ReportBuilder from '@/components/remediation/ReportBuilder'
import { Claim } from '@/lib/remediation/types'

type ViewMode = 'dashboard' | 'new-claim' | 'assessment' | 'report' | 'hvac' | 'restoration' | 'evidence'

export default function RemediationDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])

  // Mock data for dashboard
  const stats = {
    activeClaims: 12,
    completedThisMonth: 28,
    avgCompletionTime: 7.5,
    restorationRate: 78,
    totalSaved: 145000,
    pendingReports: 3
  }

  const recentClaims = [
    {
      id: '1',
      claimNumber: 'CLM-20241220-0001',
      insuredName: 'John Smith',
      address: '123 Main St, Brisbane',
      type: 'water',
      status: 'in_progress',
      dateOfLoss: '2024-12-18'
    },
    {
      id: '2',
      claimNumber: 'CLM-20241219-0002',
      insuredName: 'Sarah Johnson',
      address: '456 Queen St, Gold Coast',
      type: 'mould',
      status: 'assessment',
      dateOfLoss: '2024-12-15'
    },
    {
      id: '3',
      claimNumber: 'CLM-20241218-0003',
      insuredName: 'Mike Wilson',
      address: '789 King St, Sunshine Coast',
      type: 'fire',
      status: 'completed',
      dateOfLoss: '2024-12-10'
    }
  ]

  const handleNewClaim = (claim: Claim) => {
    setClaims([...claims, claim])
    setSelectedClaim(claim)
    setViewMode('assessment')
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'draft': { icon: Clock, color: 'text-gray-500 bg-gray-100' },
      'assessment': { icon: Search, color: 'text-blue-500 bg-blue-100' },
      'in_progress': { icon: Clock, color: 'text-yellow-500 bg-yellow-100' },
      'review': { icon: FileText, color: 'text-purple-500 bg-purple-100' },
      'completed': { icon: CheckCircle, color: 'text-green-500 bg-green-100' }
    }
    
    const Badge = badges[status] || badges['draft']
    const Icon = Badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${Badge.color}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water': return '💧'
      case 'fire': return '🔥'
      case 'mould': return '🦠'
      default: return '⚠️'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Remediation Report System</h1>
              <nav className="hidden md:flex gap-4">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('new-claim')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === 'new-claim' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  New Claim
                </button>
                {selectedClaim && (
                  <>
                    <button
                      onClick={() => setViewMode('assessment')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        viewMode === 'assessment' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Assessment
                    </button>
                    <button
                      onClick={() => setViewMode('report')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        viewMode === 'report' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Report
                    </button>
                  </>
                )}
              </nav>
            </div>
            
            <button
              onClick={() => setViewMode('new-claim')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Claim
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Claims</p>
                    <p className="text-2xl font-bold">{stats.activeClaims}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">{stats.completedThisMonth}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Days</p>
                    <p className="text-2xl font-bold">{stats.avgCompletionTime}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Restoration Rate</p>
                    <p className="text-2xl font-bold">{stats.restorationRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Saved</p>
                    <p className="text-2xl font-bold">${(stats.totalSaved/1000).toFixed(0)}k</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingReports}</p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Recent Claims Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Recent Claims</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1">
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                    <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claim #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Insured
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Loss
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {claim.claimNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.insuredName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="text-lg mr-1">{getTypeIcon(claim.type)}</span>
                          {claim.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.dateOfLoss}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(claim.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'new-claim' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">New Claim Intake</h2>
            <ClaimIntakeForm onSubmit={handleNewClaim} />
          </div>
        )}

        {viewMode === 'assessment' && selectedClaim && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Damage Assessment</h2>
              <DamageAssessmentGrid 
                claimId={selectedClaim.id}
                onDamagesUpdated={(damages) => {
                  setSelectedClaim({ ...selectedClaim, damages })
                }}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">HVAC Analysis</h2>
                <HVACAnalyzer 
                  claimId={selectedClaim.id}
                  damages={selectedClaim.damages}
                />
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Restoration Calculator</h2>
                <RestorationCalculator 
                  materials={selectedClaim.damages.flatMap(d => d.affectedMaterials)}
                  waterCategory={selectedClaim.damages[0]?.category}
                  mouldCondition={selectedClaim.damages[0]?.condition}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Evidence Upload</h2>
              <EvidenceUploader 
                claimId={selectedClaim.id}
                onEvidenceAdded={(evidence) => {
                  console.log('Evidence added:', evidence)
                }}
              />
            </div>
          </div>
        )}

        {viewMode === 'report' && selectedClaim && (
          <div className="bg-white rounded-lg shadow">
            <ReportBuilder 
              claim={selectedClaim}
              onSave={(report) => {
                console.log('Report saved:', report)
              }}
              onExport={(format) => {
                console.log('Export report as:', format)
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}