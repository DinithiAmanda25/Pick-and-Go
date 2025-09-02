import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Animation variants for different sections
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

const slideInScale = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
}

function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Modern Header */}
            <header className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 overflow-hidden">
                {/* Animated Background Pattern */}
                <motion.div
                    className="absolute inset-0 opacity-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 1 }}
                >
                    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <motion.circle
                            cx="100" cy="150" r="60" fill="rgba(59, 130, 246, 0.1)"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx="320" cy="300" r="80" fill="rgba(147, 197, 253, 0.08)"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                    </svg>
                </motion.div>

                {/* Navigation */}
                <motion.nav
                    className="relative z-10 px-6 py-4"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center space-x-3"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <motion.div
                                className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </motion.div>
                            <span className="text-2xl font-bold text-white">Pick & Go</span>
                        </motion.div>

                        {/* Navigation Links */}
                        <motion.div
                            className="hidden md:flex items-center space-x-8"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {['Home', 'Vehicles', 'Services', 'About', 'Contact', 'Join as Driver'].map((item, index) => (
                                <motion.a
                                    key={item}
                                    href={item === 'Vehicles' ? '/vehicle-rental' : item === 'Join as Driver' ? '/driver-onboarding' : `#${item.toLowerCase()}`}
                                    className="text-white/80 hover:text-white transition-colors duration-300"
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {item}
                                </motion.a>
                            ))}
                        </motion.div>

                        {/* Auth Buttons */}
                        <motion.div
                            className="hidden md:flex items-center space-x-4"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            <motion.div variants={fadeInUp}>
                                <Link
                                    to="/login"
                                    className="text-white/80 hover:text-white transition-colors duration-300 px-4 py-2"
                                >
                                    Sign In
                                </Link>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    to="/register"
                                    className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.nav>

                {/* Hero Section */}
                <div className="relative z-10 px-6 py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <motion.div
                                className="text-white space-y-8"
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <motion.div
                                    className="space-y-6"
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                >
                                    <motion.h1
                                        className="text-5xl lg:text-7xl font-bold leading-tight"
                                        variants={fadeInUp}
                                    >
                                        <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                            Rent Your Perfect
                                        </span>
                                        <br />
                                        <motion.span
                                            className="text-blue-300"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                        >
                                            Vehicle
                                        </motion.span>
                                    </motion.h1>
                                    <motion.div
                                        className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                        variants={fadeInUp}
                                        initial={{ width: 0 }}
                                        animate={{ width: "6rem" }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                    ></motion.div>
                                </motion.div>

                                <motion.p
                                    className="text-xl text-blue-100/80 leading-relaxed max-w-lg"
                                    variants={fadeInUp}
                                    initial="initial"
                                    animate="animate"
                                    transition={{ delay: 0.4 }}
                                >
                                    Experience premium vehicle rental with professional drivers. Choose from our curated fleet of modern vehicles for all your travel needs.
                                </motion.p>

                                {/* Action Buttons */}
                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                >
                                    <motion.div
                                        variants={slideInScale}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            to="/vehicle-rental"
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-center shadow-2xl inline-block"
                                        >
                                            Browse Vehicles
                                        </Link>
                                    </motion.div>
                                    <motion.div
                                        variants={slideInScale}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            to="/register"
                                            className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-center inline-block"
                                        >
                                            Get Started
                                        </Link>
                                    </motion.div>
                                </motion.div>

                                {/* Stats */}
                                <motion.div
                                    className="grid grid-cols-3 gap-8 pt-8"
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                >
                                    {[
                                        { number: "500+", label: "Vehicles" },
                                        { number: "10K+", label: "Happy Clients" },
                                        { number: "24/7", label: "Support" }
                                    ].map((stat, index) => (
                                        <motion.div
                                            key={stat.label}
                                            className="text-center"
                                            variants={fadeInUp}
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <motion.div
                                                className="text-3xl font-bold text-white"
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                            >
                                                {stat.number}
                                            </motion.div>
                                            <div className="text-blue-200 text-sm">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* Right Content - Modern Card */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            >
                                <motion.div
                                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {/* Quick Booking Card */}
                                    <motion.div
                                        className="bg-white rounded-2xl p-6 shadow-xl"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.4 }}
                                    >
                                        <motion.h3
                                            className="text-2xl font-bold text-gray-900 mb-6"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            Quick Booking
                                        </motion.h3>

                                        <motion.div
                                            className="space-y-4"
                                            variants={staggerContainer}
                                            initial="initial"
                                            animate="animate"
                                        >
                                            <motion.div variants={fadeInUp}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter pickup location"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    />
                                                    <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="grid grid-cols-2 gap-4"
                                                variants={fadeInUp}
                                            >
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                variants={fadeInUp}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Link
                                                    to="/vehicle-rental"
                                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg text-center block"
                                                >
                                                    Find Available Vehicles
                                                </Link>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Floating Feature Cards */}
                                    <motion.div
                                        className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                                        initial={{ opacity: 0, x: 50, y: -50 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.8 }}
                                        whileHover={{ scale: 1.05, rotate: 2 }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"
                                                animate={{ rotate: [0, 10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                            <div className="text-white">
                                                <div className="font-semibold">Verified</div>
                                                <div className="text-sm text-blue-200">All Vehicles</div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                                        initial={{ opacity: 0, x: -50, y: 50 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.6, delay: 1 }}
                                        whileHover={{ scale: 1.05, rotate: -2 }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </motion.div>
                                            <div className="text-white">
                                                <div className="font-semibold">Secure</div>
                                                <div className="text-sm text-blue-200">Payments</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Rest of the sections... */}
            <div className="py-20 text-center">
                <h2 className="text-4xl font-bold text-gray-900">Features section will be added here...</h2>
            </div>
        </div>
    );
}

export default Home;
