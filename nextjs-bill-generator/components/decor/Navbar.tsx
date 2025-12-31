'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/bestseller', label: 'Bestseller' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasHero, setHasHero] = useState(false)
  const [pastHeroThreshold, setPastHeroThreshold] = useState(false)
  const heroElRef = useRef<HTMLElement | null>(null)
  const thresholdRef = useRef<number>(0)
  const pathname = usePathname()

  useEffect(() => {
    heroElRef.current = document.querySelector<HTMLElement>('[data-hero="true"]')
    setHasHero(Boolean(heroElRef.current))

    const computeThreshold = () => {
      const el = heroElRef.current
      if (!el) {
        thresholdRef.current = 0
        return
      }

      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      thresholdRef.current = top + rect.height * 0.7
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        ticking = false
        const el = heroElRef.current
        if (!el) {
          setPastHeroThreshold(true)
          return
        }
        setPastHeroThreshold(window.scrollY >= thresholdRef.current)
      })
    }

    const onResize = () => {
      computeThreshold()
      onScroll()
    }

    computeThreshold()
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [pathname])

  const overlayMode = hasHero
  const showGlass = !overlayMode || isOpen || pastHeroThreshold
  const overlayText = overlayMode && !showGlass

  return (
    <nav
      className={[
        'sticky top-0 z-50 w-full transition-colors duration-300',
        showGlass
          ? 'bg-light-card/70 dark:bg-dark-card/60 backdrop-blur-xl border-b border-light-border/60 dark:border-dark-border/50 shadow-soft'
          : 'bg-transparent border-b border-transparent',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <h1
              className={[
                'font-sans text-2xl font-bold transition-colors',
                overlayText ? 'text-white' : 'text-light-text dark:text-dark-text',
              ].join(' ')}
            >
              SR Décor
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'text-sm font-medium transition-colors',
                  overlayText
                    ? 'text-white/90 hover:text-white'
                    : 'text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={[
                'transition-colors',
                overlayText ? 'text-white' : 'text-light-text dark:text-dark-text',
              ].join(' ')}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border"
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm font-medium text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}







