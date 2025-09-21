import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../Assets/2.png'

function Registration() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    userType: 'client', // 'client' or 'vehicle_owner'
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferences: {
      vehicleType: [],
      notifications: {
        email: true,
        sms: false
      }
    },
    terms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  
  const { registerClient, registerVehicleOwner } = useAuth()
  const navigate = useNavigate()

  const validateField = (name, value) => {
    let errors = { ...validationErrors }
    
    switch (name) {
      case 'firstName':
        errors.firstName = !value.trim() ? 'First name is required' : ''
        break
        
      case 'lastName':
        errors.lastName = !value.trim() ? 'Last name is required' : ''
        break
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Email format is invalid'
        } else {
          errors.email = ''
        }
        break
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required'
        } else if (!/^\d{10}$/.test(value.replace(/[^0-9]/g, ''))) {
          errors.phone = 'Phone number should have 10 digits'
        } else {
          errors.phone = ''
        }
        break
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must include uppercase, lowercase, and numbers'
        } else {
          errors.password = ''
        }
        
        // Also check confirm password match if it has a value
        if (formData.confirmPassword && formData.confirmPassword !== value) {
          errors.confirmPassword = 'Passwords do not match'
        } else if (formData.confirmPassword) {
          errors.confirmPassword = ''
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Confirm password is required'
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match'
        } else {
          errors.confirmPassword = ''
        }
        break
        
      default:
        break
    }
    
    setValidationErrors(errors)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      // Handle nested objects
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      })
    } else if (name === 'vehicleType') {
      // Handle array for vehicle preferences
      const currentTypes = formData.preferences.vehicleType
      if (checked) {
        setFormData({
          ...formData,
          preferences: {
            ...formData.preferences,
            vehicleType: [...currentTypes, value]
          }
        })
      } else {
        setFormData({
          ...formData,
          preferences: {
            ...formData.preferences,
            vehicleType: currentTypes.filter(type => type !== value)
          }
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
      
      // Validate the field if it's one we're tracking
      if (['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'].includes(name)) {
        validateField(name, value)
      }
    }
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleUserTypeChange = (type) => {
    setFormData({
      ...formData,
      userType: type
    })
    setCurrentStep(1) // Reset to first step when changing user type
    setError('')
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        // Validate each field individually to show specific errors
        validateField('firstName', formData.firstName)
        validateField('lastName', formData.lastName)
        validateField('email', formData.email)
        validateField('phone', formData.phone)
        
        // Check if any validation errors exist
        if (validationErrors.firstName || validationErrors.lastName || 
            validationErrors.email || validationErrors.phone ||
            !formData.firstName || !formData.lastName || 
            !formData.email || !formData.phone) {
          setError('Please correct all errors before proceeding')
          return false
        }
        break
        
      case 2:
        // Validate password fields
        validateField('password', formData.password)
        validateField('confirmPassword', formData.confirmPassword)
        
        if (validationErrors.password || validationErrors.confirmPassword ||
            !formData.password || !formData.confirmPassword) {
          setError('Please correct all password errors before proceeding')
          return false
        }
        
        if (formData.userType === 'client' && !formData.dateOfBirth) {
          setError('Please provide your date of birth')
          return false
        }
        break
        
      case 3:
        if (!formData.terms) {
          setError('Please accept the terms and conditions')
          return false
        }
        break
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep()) return
    
    setIsLoading(true)
    setError('')

    try {
      let response
      
      if (formData.userType === 'client') {
        response = await registerClient({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          preferences: formData.preferences
        })
      } else {
        response = await registerVehicleOwner({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        })
      }
      
      if (response.success) {
        alert(`Registration successful! Welcome, ${formData.firstName}!`)
        navigate('/login')
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Personal Information',
      2: 'Account & Security',
      3: 'Additional Details & Terms'
    }
    return titles[currentStep]
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo section */}
          <div className="mb-12">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Logo */}
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <img
                    src={logo}
                    alt="Pick & Go Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>

              {/* Brand name */}
              <div>
                <h1 className="text-5xl font-bold tracking-tight mb-2">
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Pick & Go
                  </span>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Welcome content */}
          <div className="text-center max-w-md space-y-6">
            <h2 className="text-3xl font-semibold text-white/95 leading-tight">
              Join Our Community
            </h2>
            <p className="text-lg text-blue-100/80 leading-relaxed font-light">
              Create your account and start your journey with Pick & Go. Whether you're a client or vehicle owner, we've got you covered.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="max-w-md w-full space-y-8 relative z-20">
          {/* Header */}
          <div className="text-center">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center space-x-2 text-3xl font-bold text-blue-600">
                <img
                  src={logo}
                  alt="Pick & Go Logo"
                  className="w-8 h-8 object-contain"
                />
                Pick & Go
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">{getStepTitle()}</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
          </div>

          {/* User Type Selection */}
          {currentStep === 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to register as:
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('client')}
                  className={`p-4 border-2 rounded-lg flex items-start space-x-3 transition-all ${
                    formData.userType === 'client'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <svg className="w-6 h-6 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">Client</p>
                    <p className="text-sm opacity-75">Rent vehicles for your transportation needs</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeChange('vehicle_owner')}
                  className={`p-4 border-2 rounded-lg flex items-start space-x-3 transition-all ${
                    formData.userType === 'vehicle_owner'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <svg className="w-6 h-6 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">Vehicle Owner</p>
                    <p className="text-sm opacity-75">List your vehicles and earn money from rentals</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="John"
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Doe"
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('email', e.target.value)}
                    className={`w-full px-3 py-2 border ${validationErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="john.doe@example.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    className={`w-full px-3 py-2 border ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Account & Security */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {formData.userType === 'client' && (
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border ${validationErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Choose a strong password"
                    />
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border ${validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Confirm your password"
                    />
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Password Requirements:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Mix of uppercase and lowercase letters</li>
                    <li>• At least one number</li>
                    <li>• At least one special character</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Additional Details & Terms */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Address Information
                  </label>
                  <div className="space-y-3">
                    <input
                      name="address.street"
                      type="text"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="address.city"
                        type="text"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City"
                      />
                      <input
                        name="address.state"
                        type="text"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="State"
                      />
                    </div>
                    <input
                      name="address.zipCode"
                      type="text"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                {formData.userType === 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Vehicle Preferences (Optional)
                    </label>
                    <div className="space-y-2">
                      {['SUV', 'Sedan', 'Hatchback', 'Truck', 'Van', 'Luxury'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            name="vehicleType"
                            value={type}
                            checked={formData.preferences.vehicleType.includes(type)}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-4 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          {/* Sign in link */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registration
