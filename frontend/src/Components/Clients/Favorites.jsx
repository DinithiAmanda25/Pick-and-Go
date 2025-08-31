import React from 'react'
import { motion } from 'framer-motion'

export default function Favorites({ favorites = [] }) {
  const mockFavorites = [
    { id: 1, name: 'Toyota Camry', type: 'Sedan', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', price: '$50/day', rating: 4.8 },
    { id: 2, name: 'Honda Civic', type: 'Compact', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', price: '$40/day', rating: 4.6 },
    { id: 3, name: 'BMW X5', type: 'SUV', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', price: '$90/day', rating: 4.9 },
  ];

  const favoritesToShow = favorites.length > 0 ? favorites : mockFavorites;

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

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-2">Favorite Vehicles</h2>
        <p className="text-purple-100">Your saved vehicles for quick booking</p>
      </motion.div>

      {favoritesToShow.length === 0 ? (
        <motion.div 
          className="bg-white rounded-lg shadow-md p-8 text-center"
          variants={itemVariants}
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ❤️
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600">Start adding vehicles to your favorites for quick access</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritesToShow.map((vehicle, index) => (
            <motion.div 
              key={vehicle.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 border border-gray-100"
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            >
              <div className="relative overflow-hidden">
                <motion.img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-48 object-cover" 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute top-3 right-3">
                  <motion.button 
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-red-500 text-lg">❤️</span>
                  </motion.button>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-gray-900">{vehicle.price || '$50/day'}</span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {vehicle.rating}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{vehicle.type}</p>
                
                <div className="flex space-x-2">
                  <motion.button 
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book Now
                  </motion.button>
                  <motion.button 
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
