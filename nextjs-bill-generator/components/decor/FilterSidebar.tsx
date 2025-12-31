'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { categories } from '@/data/products'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function FilterSidebar({ isOpen, onClose, selectedCategory, onCategoryChange }: FilterSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sans text-xl font-semibold text-light-text dark:text-dark-text">Filters</h2>
                  <button onClick={onClose} className="text-light-text dark:text-dark-text">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">Category</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            onCategoryChange(category)
                            onClose()
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                            selectedCategory === category
                              ? 'bg-light-accent dark:bg-dark-accent text-white'
                              : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-light-card dark:bg-dark-card rounded-2xl p-6 h-fit sticky top-24">
        <h2 className="font-sans text-xl font-semibold text-light-text dark:text-dark-text mb-6">Filters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${
                    selectedCategory === category
                      ? 'bg-light-accent dark:bg-dark-accent text-white'
                      : 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}










