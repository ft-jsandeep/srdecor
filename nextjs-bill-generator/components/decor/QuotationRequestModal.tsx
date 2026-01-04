'use client'

import { useState, FormEvent } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Product } from '@/data/products'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Mail, Phone, Info, Loader2 } from 'lucide-react'

interface QuotationRequestModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export function QuotationRequestModal({ isOpen, onClose, product }: QuotationRequestModalProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate that at least email or phone is provided
    if (!email.trim() && !phone.trim()) {
      setError('Please provide either an email address or phone number')
      return
    }

    // Validate email format if provided
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    // Validate phone format if provided (basic validation - 10 digits)
    if (phone.trim() && !/^[0-9]{10}$/.test(phone.trim().replace(/[\s-]/g, ''))) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setIsSubmitting(true)

    try {
      // Check if Firebase is configured
      if (!db) {
        throw new Error('Firebase is not configured. Please contact the administrator.')
      }

      // Save quotation request to Firestore
      await addDoc(collection(db, 'quotationRequests'), {
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        productPrice: product.price,
        customerName: name.trim() || 'Not provided',
        email: email.trim() || '',
        phone: phone.trim() || '',
        message: message.trim() || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      setSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setEmail('')
        setPhone('')
        setName('')
        setMessage('')
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Error submitting quotation request:', err)
      setError('Failed to submit request. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Quotation">
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-4">
          <h3 className="font-semibold text-light-text dark:text-dark-text mb-2">
            Product: {product.name}
          </h3>
          <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
            {product.category}
          </p>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            We collect your contact information to connect with you and provide personalized pricing for this product. 
            Our team will reach out to you shortly with the best quote and any additional information you may need.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Thank you! Your quotation request has been submitted successfully. We'll contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Optional) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address {!phone && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number {!email && <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                placeholder="10-digit phone number"
                maxLength={10}
              />
              <p className="text-xs text-light-textMuted dark:text-dark-textMuted mt-1">
                At least one contact method (email or phone) is required
              </p>
            </div>

            {/* Message (Optional) */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent resize-none"
                placeholder="Any specific requirements or questions..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

