import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function Support() {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priority, setPriority] = useState('normal')

  const categories = [
    { id: 'booking', name: 'Booking Issues', icon: '📋' },
    { id: 'payment', name: 'Payment Problems', icon: '💳' },
    { id: 'vehicle', name: 'Vehicle Issues', icon: '🚗' },
    { id: 'account', name: 'Account Settings', icon: '👤' },
    { id: 'other', name: 'Other', icon: '❓' },
  ]

  const faqs = [
    { question: 'How do I cancel my booking?', answer: 'You can cancel your booking from the Bookings tab up to 24 hours before pickup.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, and PayPal.' },
    { question: 'Can I modify my rental dates?', answer: 'Yes, you can modify dates subject to availability. Additional charges may apply.' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && selectedCategory) {
      setSubmitted(true)
      console.log({ message, category: selectedCategory, priority })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  if (submitted) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            ✅
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Support Request Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. Our support team will get back to you within 24 hours.
          </p>
          <motion.button
            onClick={() => {
              setSubmitted(false)
              setMessage('')
              setSelectedCategory('')
              setPriority('normal')
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Another Request
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-2">Customer Support</h2>
        <p className="text-orange-100">We're here to help you with any questions or issues</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue or question in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
              disabled={!message.trim() || !selectedCategory}
              whileHover={{ scale: !message.trim() || !selectedCategory ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="border-b border-gray-200 pb-4 last:border-b-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Other ways to reach us</h4>
            <div className="space-y-2">
              <motion.div 
                className="flex items-center space-x-3 text-sm text-gray-600"
                whileHover={{ x: 5 }}
              >
                <span>📞</span>
                <span>+1 (555) 123-4567</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 text-sm text-gray-600"
                whileHover={{ x: 5 }}
              >
                <span>✉️</span>
                <span>support@pickandgo.com</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 text-sm text-gray-600"
                whileHover={{ x: 5 }}
              >
                <span>💬</span>
                <span>Live chat available 24/7</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
