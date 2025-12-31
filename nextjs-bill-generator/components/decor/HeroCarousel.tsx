'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/decor/Button'

export type HeroCarouselSlide = {
  id: string
  imageSrc: string
  imageAlt: string
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel: string
  href: string
  /**
   * Text alignment for the overlay content (mobile is always centered)
   */
  desktopAlign?: 'left' | 'center'
}

function getPrefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

export function HeroCarousel({
  slides,
  autoPlayMs = 3000,
  id,
  className = '',
}: {
  slides: HeroCarouselSlide[]
  autoPlayMs?: number
  id?: string
  className?: string
}) {
  const safeSlides = slides?.filter(Boolean) ?? []
  const hasMultiple = safeSlides.length > 1

  const [[index, direction], setIndex] = useState<[number, number]>([0, 0])
  const reduceMotionRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    reduceMotionRef.current = getPrefersReducedMotion()
  }, [])

  const activeIndex = useMemo(() => {
    if (safeSlides.length === 0) return 0
    const mod = ((index % safeSlides.length) + safeSlides.length) % safeSlides.length
    return mod
  }, [index, safeSlides.length])

  const activeSlide = safeSlides[activeIndex]

  const paginate = useCallback((nextDirection: number) => {
    if (!hasMultiple) return
    setIndex(([i]) => [i + nextDirection, nextDirection])
  }, [hasMultiple])

  function goTo(nextIndex: number) {
    if (!hasMultiple) return
    if (safeSlides.length === 0) return
    setIndex(([i]) => {
      const current = ((i % safeSlides.length) + safeSlides.length) % safeSlides.length
      const next = ((nextIndex % safeSlides.length) + safeSlides.length) % safeSlides.length
      const nextDirection = next === current ? 0 : next > current ? 1 : -1
      return [nextIndex, nextDirection]
    })
  }

  // Auto-play effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!hasMultiple) return
    if (reduceMotionRef.current) return

    // Set up auto-scroll
    const interval = setInterval(() => {
      setIndex(([i]) => [i + 1, 1])
    }, autoPlayMs)
    
    intervalRef.current = interval

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoPlayMs, hasMultiple, safeSlides.length])

  const variants = {
    enter: (dir: number) => ({
      x: dir === 0 ? 0 : dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 1.01,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir === 0 ? 0 : dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.995,
    }),
  } as const

  const swipeConfidenceThreshold = 9000
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity

  return (
    <section
      id={id}
      data-hero="true"
      className={[
        'relative w-full h-[100svh] overflow-hidden -mt-20',
        className,
      ].join(' ')}
      onKeyDown={(e) => {
        if (!hasMultiple) return
        if (e.key === 'ArrowLeft') paginate(-1)
        if (e.key === 'ArrowRight') paginate(1)
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero promotions"
      tabIndex={0}
    >
      <div className="absolute inset-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeSlide?.id ?? 'empty'}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            drag={hasMultiple ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, { offset, velocity }) => {
              if (!hasMultiple) return
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) paginate(1)
              else if (swipe > swipeConfidenceThreshold) paginate(-1)
            }}
          >
            {activeSlide ? (
              <Image
                src={activeSlide.imageSrc}
                alt={activeSlide.imageAlt}
                fill
                priority={activeIndex === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative h-full flex items-center">
        <div className="w-full px-6 md:px-14">
          <div
            className={[
              'max-w-2xl mx-auto text-center',
              activeSlide?.desktopAlign === 'left' 
                ? 'md:mx-0 md:text-left md:pl-20 md:pr-20' 
                : 'md:mx-auto md:text-center md:px-20',
            ].join(' ')}
          >
            {activeSlide?.eyebrow ? (
              <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-white/90 text-sm tracking-wide backdrop-blur-sm border border-white/15 mb-6">
                {activeSlide.eyebrow}
              </div>
            ) : null}

            <h1 className="font-sans text-4xl md:text-6xl font-bold text-white leading-tight">
              {activeSlide?.title ?? ''}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mt-5">
              {activeSlide?.subtitle ?? ''}
            </p>

            <div className="mt-9 flex items-center justify-center md:justify-start gap-3">
              <Link href={activeSlide?.href ?? '/products'}>
                <Button variant="primary" className="!bg-dark-accent dark:!bg-dark-accent !text-white hover:!opacity-90">
                  {activeSlide?.ctaLabel ?? 'Explore Collection'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              className="group absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/35 hover:bg-black/50 border border-white/15 text-white backdrop-blur-sm transition focus:outline-none focus:ring-2 focus:ring-white/70"
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
            >
              <ChevronLeft className="mx-auto opacity-90 group-hover:opacity-100" size={22} />
            </button>
            <button
              type="button"
              className="group absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/35 hover:bg-black/50 border border-white/15 text-white backdrop-blur-sm transition focus:outline-none focus:ring-2 focus:ring-white/70"
              onClick={() => paginate(1)}
              aria-label="Next slide"
            >
              <ChevronRight className="mx-auto opacity-90 group-hover:opacity-100" size={22} />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 px-6">
          {safeSlides.map((s, i) => {
            const isActive = i === activeIndex
            return (
              <button
                key={s.id}
                type="button"
                className={[
                  'h-2.5 rounded-full transition-all',
                  isActive ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70',
                ].join(' ')}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive ? 'true' : 'false'}
                onClick={() => goTo(i)}
              />
            )
          })}
        </div>
      ) : null}
    </section>
  )
}


