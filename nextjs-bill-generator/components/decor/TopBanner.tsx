'use client'

import { Facebook, Instagram } from 'lucide-react'

// Simple Pinterest icon component
function PinterestIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8-.1-.95-.19-2.4.04-3.43.21-.9 1.35-5.76 1.35-5.76s-.34-.68-.34-1.68c0-1.57.91-2.74 2.05-2.74.97 0 1.44.73 1.44 1.6 0 .98-.63 2.45-.95 3.81-.27 1.15.58 2.09 1.72 2.09 2.06 0 3.65-2.17 3.65-5.31 0-2.78-2-4.72-4.85-4.72-3.3 0-5.24 2.48-5.24 5.04 0 .98.38 2.03.85 2.66.09.11.11.21.08.32l-.34 1.36c-.04.18-.14.22-.33.13-1.24-.58-2.02-2.4-2.02-3.86 0-3.15 2.29-6.05 6.59-6.05 3.46 0 6.15 2.52 6.15 5.88 0 3.43-2.16 6.18-5.15 6.18-1.01 0-1.96-.53-2.28-1.22l-.62 2.36c-.22.87-.82 1.96-1.22 2.63.92.28 1.9.44 2.92.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  )
}

export function TopBanner() {
  return (
    <div className="relative bg-light-surface dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-4">
          {/* Social Media Icons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-8 h-8 rounded-full border-2 border-light-text dark:border-dark-text flex items-center justify-center text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full border-2 border-light-text dark:border-dark-text flex items-center justify-center text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
              aria-label="Pinterest"
            >
              <PinterestIcon size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full border-2 border-light-text dark:border-dark-text flex items-center justify-center text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
          </div>

          {/* Contact Text */}
          <div className="text-light-text dark:text-dark-text text-sm sm:text-base text-center sm:text-left">
            Call <a href="tel:+919811627334" className="hover:underline text-light-accent dark:text-dark-accent">+91 9811627334</a> For All Sales Inquiries
          </div>
        </div>
      </div>
    </div>
  )
}

