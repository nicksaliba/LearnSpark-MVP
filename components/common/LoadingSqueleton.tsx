
// components/common/LoadingSkeleton.tsx
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface LoadingSkeletonProps {
  variant: 'lesson-card' | 'lesson-list' | 'dashboard' | 'code-editor' | 'profile'
  count?: number
}

export function LoadingSkeleton({ variant, count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'lesson-card':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Skeleton height={24} width="70%" className="mb-2" />
                    <Skeleton height={16} width="90%" />
                    <Skeleton height={16} width="60%" className="mt-2" />
                  </div>
                  <Skeleton height={20} width={80} />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Skeleton height={16} width={60} />
                  <Skeleton height={16} width={60} />
                  <Skeleton height={16} width={60} />
                </div>
              </div>
            ))}
          </div>
        )

      case 'lesson-list':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded">
                <Skeleton circle height={24} width={24} />
                <div className="flex-1">
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={14} width="20%" className="mt-1" />
                </div>
                <Skeleton height={32} width={80} />
              </div>
            ))}
          </div>
        )

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div>
              <Skeleton height={32} width="60%" className="mb-2" />
              <Skeleton height={20} width="40%" />
            </div>
            
            {/* Stats cards skeleton */}
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton height={16} width="50%" />
                    <Skeleton circle height={32} width={32} />
                  </div>
                  <Skeleton height={28} width="40%" className="mb-2" />
                  <Skeleton height={14} width="60%" />
                </div>
              ))}
            </div>

            {/* Module cards skeleton */}
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton height={120} />
                  <div className="p-6">
                    <Skeleton height={20} width="80%" className="mb-2" />
                    <Skeleton height={16} width="60%" className="mb-4" />
                    <Skeleton height={8} className="mb-2" />
                    <Skeleton height={40} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'code-editor':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Skeleton height={20} width="30%" />
                <div className="flex gap-2">
                  <Skeleton height={32} width={80} />
                  <Skeleton height={32} width={80} />
                </div>
              </div>
              <Skeleton height={300} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <Skeleton height={20} width="40%" className="mb-3" />
                <Skeleton height={150} />
              </div>
              <div className="border rounded-lg p-4">
                <Skeleton height={20} width="40%" className="mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height={60} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton circle height={80} width={80} />
              <div className="flex-1">
                <Skeleton height={24} width="40%" className="mb-2" />
                <Skeleton height={16} width="60%" className="mb-1" />
                <Skeleton height={16} width="30%" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton height={18} width="50%" className="mb-3" />
                  <Skeleton height={14} width="80%" className="mb-1" />
                  <Skeleton height={14} width="60%" />
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <Skeleton height={20} />
    }
  }

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      {renderSkeleton()}
    </SkeletonTheme>
  )
}