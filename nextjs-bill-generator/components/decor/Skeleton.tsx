'use client'

export function ProductCardSkeleton() {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden shadow-soft animate-pulse">
      <div className="aspect-square bg-light-surface dark:bg-dark-surface" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-light-surface dark:bg-dark-surface rounded w-3/4" />
        <div className="h-4 bg-light-surface dark:bg-dark-surface rounded w-full" />
        <div className="h-4 bg-light-surface dark:bg-dark-surface rounded w-2/3" />
        <div className="h-8 bg-light-surface dark:bg-dark-surface rounded w-1/2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}











