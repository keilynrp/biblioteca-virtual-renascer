'use client'

import { useState, useEffect } from 'react'
import { subscriptionsApi, TrialStatus } from '@/services/subscriptionsApi'
import { useAuthStoreHydrated } from '@/store/authStore'

export function useTrialStatus() {
  const { isAuthenticated, _hasHydrated, user } = useAuthStoreHydrated()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || user?.user_type === 'admin') {
      setIsLoading(false)
      return
    }
    subscriptionsApi.getTrialStatus()
      .then(setTrialStatus)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [_hasHydrated, isAuthenticated, user?.user_type])

  return { trialStatus, isLoading }
}
