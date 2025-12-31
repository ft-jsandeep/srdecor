'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, Award, Users, Sparkles } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Award size={40} />,
      title: 'Premium Quality',
      description: 'We source only the finest materials and craftsmanship for our products.',
    },
    {
      icon: <Heart size={40} />,
      title: 'Passion for Design',
      description: 'Every piece is carefully curated to bring elegance to your home.',
    },
    {
      icon: <Users size={40} />,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We stand behind every product.',
    },
    {
      icon: <Sparkles size={40} />,
      title: 'Timeless Elegance',
      description: 'Our designs transcend trends, creating spaces that last generations.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Banner */}
      <section className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920"
            alt="About SR Décor"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        <div className="relative h-full flex items-center px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-sans text-4xl md:text-6xl font-bold text-white mb-4">
              About SR Décor
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Crafting elegant living spaces with premium home décor
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-sans text-4xl font-bold text-light-text dark:text-dark-text mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-light-textMuted dark:text-dark-textMuted">
              <p>
                Founded with a vision to transform houses into homes, SR Décor has been at the
                forefront of elegant interior design for over a decade. We believe that every space
                deserves to reflect the personality and style of its inhabitants.
              </p>
              <p>
                Our journey began with a simple mission: to make premium home décor accessible
                without compromising on quality or design. Today, we curate collections from
                renowned artisans and designers worldwide, bringing you pieces that tell a story.
              </p>
              <p>
                Each product in our collection is carefully selected for its craftsmanship, quality,
                and ability to elevate your living space. We don't just sell furniture and
                accessories—we help you create environments where memories are made.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] rounded-2xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"
              alt="Our Story"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-light-surface dark:bg-dark-surface rounded-2xl p-8 md:p-12"
        >
          <h2 className="font-sans text-4xl font-bold text-light-text dark:text-dark-text mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-lg text-light-textMuted dark:text-dark-textMuted text-center max-w-3xl mx-auto">
            To inspire and enable people to create beautiful, functional living spaces that reflect
            their unique style and enhance their quality of life. We are committed to offering
            exceptional products, outstanding service, and timeless design that stands the test of
            time.
          </p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-sans text-4xl font-bold text-center text-light-text dark:text-dark-text mb-12"
        >
          Why Choose Us
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-light-card dark:bg-dark-card rounded-2xl p-8 text-center shadow-soft hover:shadow-soft-lg transition-all"
            >
              <div className="text-light-accent dark:text-dark-accent mb-4 flex justify-center">
                {value.icon}
              </div>
              <h3 className="font-sans text-xl font-semibold text-light-text dark:text-dark-text mb-3">
                {value.title}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}










