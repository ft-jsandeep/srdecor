'use client'

import { ReactNode } from 'react'

interface TagProps {
  variant?: 'bestseller' | 'new' | 'default'
  children: ReactNode
}

export function Tag({ variant = 'default', children }: TagProps) {
  const variants = {
    bestseller: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
    new: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    default: 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}










