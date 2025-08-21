import React from 'react'

interface FeatureFlag {
  name: string
  description: string
  enabled: boolean
  rolloutPercentage?: number
  enabledForUsers?: string[]
}

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag>

  constructor() {
    this.flags = new Map()
    this.initializeFlags()
  }

  private initializeFlags() {
    // Original flags
    this.register({
      name: 'new_ui',
      description: 'New UI design system',
      enabled: process.env.NEXT_PUBLIC_FEATURE_NEW_UI === 'true',
    })

    this.register({
      name: 'beta_features',
      description: 'Beta features for early adopters',
      enabled: process.env.NEXT_PUBLIC_FEATURE_BETA_FEATURES === 'true',
    })

    this.register({
      name: 'analytics',
      description: 'Analytics tracking',
      enabled: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
    })

    this.register({
      name: 'aiOrchestrator',
      description: 'AI Orchestrator service integration',
      enabled: process.env.NEXT_PUBLIC_FEATURE_AI_ORCHESTRATOR === 'true',
    })

    // Remediation-specific feature flags
    this.register({
      name: 'damage_assessment_grid',
      description: 'Advanced damage assessment grid with visual mapping',
      enabled: process.env.NEXT_PUBLIC_FEATURE_DAMAGE_GRID === 'true' || true,
      rolloutPercentage: 100,
    })

    this.register({
      name: 'hvac_analyzer',
      description: 'HVAC contamination spread analysis tool',
      enabled: process.env.NEXT_PUBLIC_FEATURE_HVAC_ANALYZER === 'true' || true,
      rolloutPercentage: 100,
    })

    this.register({
      name: 'restoration_calculator',
      description: 'Restoration vs replacement cost calculator',
      enabled: process.env.NEXT_PUBLIC_FEATURE_RESTORATION_CALC === 'true' || true,
      rolloutPercentage: 100,
    })

    this.register({
      name: 'evidence_uploader',
      description: 'Evidence and photo upload management',
      enabled: process.env.NEXT_PUBLIC_FEATURE_EVIDENCE_UPLOAD === 'true' || true,
      rolloutPercentage: 100,
    })

    this.register({
      name: 'report_builder',
      description: 'Professional report generation with IICRC citations',
      enabled: process.env.NEXT_PUBLIC_FEATURE_REPORT_BUILDER === 'true' || true,
      rolloutPercentage: 100,
    })

    this.register({
      name: 'ai_recommendations',
      description: 'AI-powered remediation recommendations',
      enabled: process.env.NEXT_PUBLIC_FEATURE_AI_RECOMMENDATIONS === 'true' || false,
      rolloutPercentage: 25,
      enabledForUsers: ['beta_tester_1', 'beta_tester_2'],
    })

    this.register({
      name: 'predictive_drying',
      description: 'Predictive drying time calculations',
      enabled: process.env.NEXT_PUBLIC_FEATURE_PREDICTIVE_DRYING === 'true' || false,
      rolloutPercentage: 50,
    })

    this.register({
      name: 'mobile_app',
      description: 'Mobile application features',
      enabled: process.env.NEXT_PUBLIC_FEATURE_MOBILE_APP === 'true' || false,
      rolloutPercentage: 10,
    })

    this.register({
      name: 'voice_notes',
      description: 'Voice notes for damage assessment',
      enabled: process.env.NEXT_PUBLIC_FEATURE_VOICE_NOTES === 'true' || false,
      rolloutPercentage: 0,
    })

    this.register({
      name: 'ar_measurements',
      description: 'Augmented reality measurement tools',
      enabled: process.env.NEXT_PUBLIC_FEATURE_AR_MEASUREMENTS === 'true' || false,
      rolloutPercentage: 0,
    })

    this.register({
      name: 'realtime_collaboration',
      description: 'Real-time collaboration on reports',
      enabled: process.env.NEXT_PUBLIC_FEATURE_REALTIME_COLLAB === 'true' || false,
      rolloutPercentage: 75,
    })

    this.register({
      name: 'customer_portal',
      description: 'Customer self-service portal',
      enabled: process.env.NEXT_PUBLIC_FEATURE_CUSTOMER_PORTAL === 'true' || false,
      rolloutPercentage: 30,
    })

    this.register({
      name: 'advanced_analytics',
      description: 'Advanced analytics and reporting dashboard',
      enabled: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_ANALYTICS === 'true' || false,
      rolloutPercentage: 100,
      enabledForUsers: ['admin', 'manager'],
    })

    this.register({
      name: 'api_integrations',
      description: 'Third-party API integrations (Xactimate, Insurance)',
      enabled: process.env.NEXT_PUBLIC_FEATURE_API_INTEGRATIONS === 'true' || false,
      rolloutPercentage: 0,
    })

    this.register({
      name: 'compliance_automation',
      description: 'Automated IICRC compliance checking',
      enabled: process.env.NEXT_PUBLIC_FEATURE_COMPLIANCE_AUTO === 'true' || true,
      rolloutPercentage: 100,
    })
  }

  register(flag: FeatureFlag) {
    this.flags.set(flag.name, flag)
  }

  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags.get(flagName)
    
    if (!flag) {
      console.warn(`Feature flag "${flagName}" not found`)
      return false
    }

    if (!flag.enabled) {
      return false
    }

    if (userId && flag.enabledForUsers) {
      return flag.enabledForUsers.includes(userId)
    }

    if (flag.rolloutPercentage !== undefined) {
      const hash = this.hashString(userId || 'anonymous')
      const percentage = (hash % 100) + 1
      return percentage <= flag.rolloutPercentage
    }

    return true
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  enable(flagName: string) {
    const flag = this.flags.get(flagName)
    if (flag) {
      flag.enabled = true
    }
  }

  disable(flagName: string) {
    const flag = this.flags.get(flagName)
    if (flag) {
      flag.enabled = false
    }
  }

  setRolloutPercentage(flagName: string, percentage: number) {
    const flag = this.flags.get(flagName)
    if (flag) {
      flag.rolloutPercentage = Math.min(100, Math.max(0, percentage))
    }
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  withFlag<T>(
    flagName: string,
    enabledCallback: () => T,
    disabledCallback: () => T,
    userId?: string
  ): T {
    return this.isEnabled(flagName, userId)
      ? enabledCallback()
      : disabledCallback()
  }
}

export const featureFlags = new FeatureFlagManager()

export function useFeatureFlag(flagName: string, userId?: string): boolean {
  return featureFlags.isEnabled(flagName, userId)
}

export function FeatureFlag({
  flag,
  userId,
  children,
  fallback = null,
}: {
  flag: string
  userId?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const isEnabled = useFeatureFlag(flag, userId)
  return <>{isEnabled ? children : fallback}</>
}