// Re-export types from database for compatibility
export * from '@/types/database'

// Additional remediation-specific types
export interface RemediationReport {
  id: string
  claimId: string
  sections: ReportSection[]
  status: 'draft' | 'review' | 'approved' | 'submitted'
  createdAt: Date
  updatedAt: Date
  approvedBy?: string
  approvedAt?: Date
}

export interface ReportSection {
  id: string
  title: string
  content: string
  citations: string[]
  required: boolean
  completed: boolean
}