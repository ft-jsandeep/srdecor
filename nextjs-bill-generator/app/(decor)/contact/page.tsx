'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/decor/Button'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h1 className="font-sans text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
          Get in Touch
        </h1>
        <p className="text-light-textMuted dark:text-dark-textMuted">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h2 className="font-sans text-2xl font-semibold text-light-text dark:text-dark-text mb-6">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface">
                  <Mail className="text-light-accent dark:text-dark-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">Email</h3>
                  <p className="text-light-textMuted dark:text-dark-textMuted">info@srdecor.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface">
                  <Phone className="text-light-accent dark:text-dark-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">Phone</h3>
                  <p className="text-light-textMuted dark:text-dark-textMuted">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-light-surface dark:bg-dark-surface">
                  <MapPin className="text-light-accent dark:text-dark-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">Address</h3>
                  <p className="text-light-textMuted dark:text-dark-textMuted">
                    123 Design Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-8">
            <div className="h-64 bg-light-surface dark:bg-dark-surface rounded-2xl flex items-center justify-center">
              <p className="text-light-textMuted dark:text-dark-textMuted">Map placeholder</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="bg-light-card dark:bg-dark-card rounded-2xl p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent resize-none"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Send Message
              <Send size={18} className="ml-2" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}










