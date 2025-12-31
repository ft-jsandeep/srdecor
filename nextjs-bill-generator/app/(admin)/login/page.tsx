'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/decor/Button'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple authentication (in production, use proper auth)
    if (credentials.email === 'admin@srdecor.com' && credentials.password === 'admin123') {
      localStorage.setItem('admin_token', 'authenticated')
      router.push('/admin/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-light-card dark:bg-dark-card rounded-2xl p-8 shadow-soft-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-light-surface dark:bg-dark-surface mb-4">
            <Lock className="text-light-accent dark:text-dark-accent" size={32} />
          </div>
          <h1 className="font-sans text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            Admin Login
          </h1>
          <p className="text-light-textMuted dark:text-dark-textMuted">
            Sign in to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              placeholder="admin@srdecor.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign In
          </Button>

          <p className="text-xs text-center text-light-textMuted dark:text-dark-textMuted">
            Demo credentials: admin@srdecor.com / admin123
          </p>
        </form>
      </motion.div>
    </div>
  )
}


