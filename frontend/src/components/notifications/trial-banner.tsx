"use client"

import { Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTrialStatus } from "@/hooks/use-trial-status"

const TRIAL_DAYS = 14

function getColorClasses(daysRemaining: number) {
  if (daysRemaining >= 7) {
    return {
      banner: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
      bar: "bg-green-500",
    }
  }
  if (daysRemaining >= 3) {
    return {
      banner: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
      bar: "bg-yellow-500",
    }
  }
  if (daysRemaining >= 1) {
    return {
      banner: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400",
      bar: "bg-orange-500",
    }
  }
  return {
    banner: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
    bar: "bg-red-500",
  }
}

export function TrialBanner() {
  const router = useRouter()
  const { trialStatus, isLoading } = useTrialStatus()

  if (isLoading || !trialStatus || !trialStatus.is_on_trial) {
    return null
  }

  const { days_remaining } = trialStatus
  const colors = getColorClasses(days_remaining)
  const progressPercent = Math.round((days_remaining / TRIAL_DAYS) * 100)

  return (
    <div className={`border-b px-6 py-2.5 ${colors.banner}`}>
      <div className="flex items-center justify-between gap-4 max-w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-sm font-medium">
              {days_remaining === 0
                ? "Tu período de prueba vence hoy"
                : `Tu período de prueba vence en ${days_remaining} día${days_remaining !== 1 ? "s" : ""}`}
            </span>
            <div className="h-1 w-full max-w-xs rounded-full bg-current/20">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${colors.bar}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="flex-shrink-0 border-current hover:bg-current/10 text-current"
          onClick={() => router.push('/plans')}
        >
          Ver Planes
        </Button>
      </div>
    </div>
  )
}
