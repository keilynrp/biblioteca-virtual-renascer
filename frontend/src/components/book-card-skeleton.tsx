
import { Skeleton } from "@/components/ui/skeleton"

export function BookCardSkeleton() {
    return (
        <div className="flex flex-col h-full">
            {/* Cover skeleton */}
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5 mb-3">
                <Skeleton className="h-full w-full" />
            </div>
            {/* Info skeleton */}
            <div className="flex flex-col space-y-2 px-0.5">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3 rounded-md" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-9 w-full rounded-md mt-2" />
            </div>
        </div>
    )
}
