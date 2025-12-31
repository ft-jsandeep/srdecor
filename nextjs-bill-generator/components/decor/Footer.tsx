'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="font-sans text-2xl font-bold text-light-text dark:text-dark-text mb-4">
              SR Décor
            </h2>
            <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
              Elegant home décor for your living spaces. Premium quality, timeless design.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=Furniture" className="text-sm text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                  Furniture
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="text-sm text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?category=Textiles" className="text-sm text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                  Textiles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-light-textMuted dark:text-dark-textMuted hover:text-light-accent dark:hover:text-dark-accent transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-light-border dark:border-dark-border text-center text-sm text-light-textMuted dark:text-dark-textMuted">
          <p>&copy; {new Date().getFullYear()} SR Décor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}










