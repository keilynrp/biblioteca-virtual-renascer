import api from '@/lib/api'

export interface TrialStatus {
  is_on_trial: boolean
  days_remaining: number
  trial_end_date: string | null
  has_active_subscription: boolean
  trial_expired: boolean
}

export const subscriptionsApi = {
  getTrialStatus: async (): Promise<TrialStatus> => {
    const response = await api.get('/subscriptions/trial-status/')
    return response.data
  }
}
