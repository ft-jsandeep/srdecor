'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type CategoryChip = {
  label: string
  href: string
  description?: string
  icon?: React.ReactNode
}

export function CategoryChipsCarousel({
  items,
  ariaLabel = 'Shop by category',
}: {
  items: CategoryChip[]
  ariaLabel?: string
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const safeItems = useMemo(() => items?.filter(Boolean) ?? [], [items])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setCanLeft(el.scrollLeft > 0)
      setCanRight(el.scrollLeft < max - 1)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.75) * dir
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pr-2"
        role="region"
        aria-label={ariaLabel}
      >
        {safeItems.map((item, index) => (
          <motion.div
            key={`${item.href}-${item.label}-${index}`}
            initial={false}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="snap-start shrink-0 w-[220px] sm:w-[260px]"
          >
            <Link
              href={item.href}
              className="group block rounded-2xl border border-light-border/70 dark:border-dark-border/60 bg-light-card/80 dark:bg-dark-card/70 backdrop-blur-md shadow-soft hover:shadow-soft-lg transition-all"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border/70 dark:border-dark-border/60 flex items-center justify-center">
                    <div className="text-light-accent dark:text-dark-accent">
                      {item.icon ?? <span className="text-xl">▦</span>}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-sans text-lg font-semibold text-light-text dark:text-dark-text group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors truncate">
                      {item.label}
                    </div>
                    {item.description ? (
                      <div className="mt-1 text-sm text-light-textMuted dark:text-dark-textMuted line-clamp-2">
                        {item.description}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-light-textMuted dark:text-dark-textMuted">
                        Explore
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Desktop arrows */}
      <div className="hidden md:block pointer-events-none">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          disabled={!canLeft}
          aria-label="Scroll categories left"
          className={[
            'pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
            'h-11 w-11 rounded-full border backdrop-blur-md transition',
            canLeft
              ? 'bg-light-card/70 dark:bg-dark-card/60 border-light-border/60 dark:border-dark-border/50 shadow-soft hover:bg-light-card/90 dark:hover:bg-dark-card/80'
              : 'bg-light-card/30 dark:bg-dark-card/20 border-transparent opacity-0',
          ].join(' ')}
        >
          <ChevronLeft className="mx-auto text-light-text dark:text-dark-text" size={20} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          disabled={!canRight}
          aria-label="Scroll categories right"
          className={[
            'pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
            'h-11 w-11 rounded-full border backdrop-blur-md transition',
            canRight
              ? 'bg-light-card/70 dark:bg-dark-card/60 border-light-border/60 dark:border-dark-border/50 shadow-soft hover:bg-light-card/90 dark:hover:bg-dark-card/80'
              : 'bg-light-card/30 dark:bg-dark-card/20 border-transparent opacity-0',
          ].join(' ')}
        >
          <ChevronRight className="mx-auto text-light-text dark:text-dark-text" size={20} />
        </button>
      </div>
    </div>
  )
}


