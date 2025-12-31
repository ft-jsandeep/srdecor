'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProductGrid } from '@/components/decor/ProductGrid'
import { BestsellerCarousel } from '@/components/decor/BestsellerCarousel'
import { Button } from '@/components/decor/Button'
import { HeroCarousel, type HeroCarouselSlide } from '@/components/decor/HeroCarousel'
import { CategoryGrid } from '@/components/decor/CategoryGrid'
import { getBestsellers, getNewArrivals } from '@/data/products'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HomePage() {
  const bestsellers = getBestsellers().slice(0, 4)
  const newArrivals = getNewArrivals().slice(0, 4)
  const categories = [
    {
      label: 'Furniture',
      href: '/products?category=Furniture',
      imageSrc: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      imageAlt: 'Luxury furniture collection',
    },
    {
      label: 'Accessories',
      href: '/products?category=Accessories',
      imageSrc: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      imageAlt: 'Home accessories and decor',
    },
    {
      label: 'Textiles',
      href: '/products?category=Textiles',
      imageSrc: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
      imageAlt: 'Premium textiles and fabrics',
    },
    {
      label: 'Lighting',
      href: '/products?category=Lighting',
      imageSrc: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
      imageAlt: 'Modern lighting fixtures',
    },
    {
      label: 'Furniture',
      href: '/products?category=Furniture',
      imageSrc: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      imageAlt: 'Luxury furniture collection',
    },
    {
      label: 'Accessories',
      href: '/products?category=Accessories',
      imageSrc: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      imageAlt: 'Home accessories and decor',
    },
    {
      label: 'Textiles',
      href: '/products?category=Textiles',
      imageSrc: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
      imageAlt: 'Premium textiles and fabrics',
    },
    {
      label: 'Lighting',
      href: '/products?category=Lighting',
      imageSrc: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
      imageAlt: 'Modern lighting fixtures',
    },
    {
      label: 'Textiles',
      href: '/products?category=Textiles',
      imageSrc: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
      imageAlt: 'Premium textiles and fabrics',
    },
    {
      label: 'Lighting',
      href: '/products?category=Lighting',
      imageSrc: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
      imageAlt: 'Modern lighting fixtures',
    },
  ]

  const categoryTextBlock = {
    headline: 'Magical\nIllumination',
    description: 'Create the perfect ambiance with lighting that adds warmth and style to every room',
  }
  const heroSlides: HeroCarouselSlide[] = [
    {
      id: 'curtains',
      imageSrc: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=2400',
      imageAlt: 'Luxury interiors with warm tones',
      eyebrow: 'New Season • Premium Décor',
      title: 'Elevate Every Room',
      subtitle: 'Curated home décor designed for modern, elegant living.',
      ctaLabel: 'Explore Collection',
      href: '/products',
      desktopAlign: 'left',
    },
    {
      id: 'textiles',
      imageSrc: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2400',
      imageAlt: 'Minimal living room décor',
      eyebrow: 'Textures • Neutrals • Layers',
      title: 'Soft Textiles, Bold Impact',
      subtitle: 'Refresh your space with premium fabrics and timeless patterns.',
      ctaLabel: 'Shop Textiles',
      href: '/products?category=Textiles',
      desktopAlign: 'left',
    },
    {
      id: 'lighting',
      imageSrc: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=2400',
      imageAlt: 'Warm lighting in a modern home',
      eyebrow: 'Lighting that sets the mood',
      title: 'Make Your Home Glow',
      subtitle: 'Statement lighting pieces for a warm, inviting atmosphere.',
      ctaLabel: 'Shop Lighting',
      href: '/products?category=Lighting',
      desktopAlign: 'left',
    },
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroCarousel id="home-hero" slides={heroSlides} className="h-[100svh]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

      {/* Categories */}
      <section className="mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-sans text-4xl font-bold text-center text-light-text dark:text-dark-text mb-12"
        >
          Shop by Category
        </motion.h2>
        <CategoryGrid items={categories} textBlock={categoryTextBlock} />
      </section>
      </div>

      {/* Bestsellers - Full Width */}
      <section className="mb-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-sans text-4xl font-bold text-light-text dark:text-dark-text"
            >
              Bestsellers
            </motion.h2>
            <Link href="/bestseller" className="flex items-center">
              <Button variant="ghost" className="flex items-center gap-2">
                View All
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
        <BestsellerCarousel products={bestsellers} />
      </section>

      {/* New Arrivals - Full Width */}
      <section className="mb-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <Sparkles className="text-light-accent dark:text-dark-accent" size={32} />
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-sans text-4xl font-bold text-light-text dark:text-dark-text"
              >
                New Arrivals
              </motion.h2>
            </div>
            <Link href="/new-arrivals" className="flex items-center">
              <Button variant="ghost" className="flex items-center gap-2">
                View All
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>
    </div>
  )
}




