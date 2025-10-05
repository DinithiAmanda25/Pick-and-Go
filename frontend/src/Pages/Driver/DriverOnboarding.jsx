import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AuthService from '../../Services/auth-service.js'
import DriverService from '../../Services/driver-service.js'
import logo from '../../Assets/2.png'

function DriverOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',

    // Driver Specific Information
    licenseNumber: '',
    licenseExpiryDate: '',
    vehicleType: '',
    yearsOfExperience: '',

    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },

    // Emergency Contact
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },

    // Documents
    documents: {
      license: null,
      insurance: null,
      registration: null,
      identityCard: null,
      medicalCertificate: null
    },

    // Terms and Conditions
    terms: false,
    dataProcessing: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    vehicleType: '',
    yearsOfExperience: ''
  })
  const [uploadProgress, setUploadProgress] = useState({})

  const { registerDriver } = useAuth()
  const navigate = useNavigate()

  const vehicleTypes = [
    'Car',
    'SUV',
    'Van',
    'Pickup Truck',
    'Motorcycle',
    'Three Wheeler',
    'Mini Bus',
    'Other'
  ]

  const relationshipOptions = [
    'Spouse',
    'Parent',
    'Sibling',
    'Child',
    'Friend',
    'Relative',
    'Other'
  ]

  const validateField = (name, value) => {
    let newErrors = { ...validationErrors }

    switch (name) {
      case 'fullName':
        newErrors.fullName = !value.trim() ? 'Full name is required' : ''
        break

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Email format is invalid'
        } else {
          newErrors.email = ''
        }
        break

      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required'
        } else if (!/^\d{10}$/.test(value.replace(/[^0-9]/g, ''))) {
          newErrors.phone = 'Phone number should have 10 digits'
        } else {
          newErrors.phone = ''
        }
        break

      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required'
        } else {
          const dob = new Date(value)
          const today = new Date()
          const age = today.getFullYear() - dob.getFullYear()
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old'
          } else if (age > 70) {
            newErrors.dateOfBirth = 'Age exceeds the maximum limit for drivers'
          } else {
            newErrors.dateOfBirth = ''
          }
        }
        break

      case 'licenseNumber':
        newErrors.licenseNumber = !value.trim() ? 'License number is required' : ''
        break

      case 'licenseExpiryDate':
        if (!value) {
          newErrors.licenseExpiryDate = 'License expiry date is required'
        } else {
          const expiryDate = new Date(value)
          const today = new Date()
          if (expiryDate <= today) {
            newErrors.licenseExpiryDate = 'License is expired'
          } else {
            newErrors.licenseExpiryDate = ''
          }
        }
        break

      case 'vehicleType':
        newErrors.vehicleType = !value ? 'Vehicle type is required' : ''
        break

      case 'yearsOfExperience':
        if (!value) {
          newErrors.yearsOfExperience = 'Years of experience is required'
        } else if (isNaN(value) || Number(value) < 0) {
          newErrors.yearsOfExperience = 'Please enter a valid number'
        } else {
          newErrors.yearsOfExperience = ''
        }
        break

      default:
        break
    }

    setValidationErrors(newErrors)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))

      // Validate fields that we're tracking
      if (['fullName', 'email', 'phone', 'dateOfBirth', 'licenseNumber',
        'licenseExpiryDate', 'vehicleType', 'yearsOfExperience'].includes(name)) {
        validateField(name, value)
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileUpload = (documentType, file) => {
    if (!file) return

    console.log('Uploading file:', documentType, file.name)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'Please upload only PDF, JPG, JPEG, or PNG files'
      }))
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'File size must be less than 5MB'
      }))
      return
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }))

    // Clear any previous errors
    setErrors(prev => ({ ...prev, [documentType]: '' }))

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }))
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[documentType] || 0) + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          return { ...prev, [documentType]: 100 }
        }
        return { ...prev, [documentType]: newProgress }
      })
    }, 100)
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1: // Personal Information
        // First run individual field validations to update the validationErrors state
        validateField('fullName', formData.fullName)
        validateField('email', formData.email)
        validateField('phone', formData.phone)
        validateField('dateOfBirth', formData.dateOfBirth)

        // Copy validation errors to display errors
        if (validationErrors.fullName) newErrors.fullName = validationErrors.fullName
        if (validationErrors.email) newErrors.email = validationErrors.email
        if (validationErrors.phone) newErrors.phone = validationErrors.phone
        if (validationErrors.dateOfBirth) newErrors.dateOfBirth = validationErrors.dateOfBirth

        // Also check for empty fields
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
        break

      case 2: // Driver Information
        // Validate individual fields
        validateField('licenseNumber', formData.licenseNumber)
        validateField('licenseExpiryDate', formData.licenseExpiryDate)
        validateField('vehicleType', formData.vehicleType)
        validateField('yearsOfExperience', formData.yearsOfExperience)

        // Copy validation errors
        if (validationErrors.licenseNumber) newErrors.licenseNumber = validationErrors.licenseNumber
        if (validationErrors.licenseExpiryDate) newErrors.licenseExpiryDate = validationErrors.licenseExpiryDate
        if (validationErrors.vehicleType) newErrors.vehicleType = validationErrors.vehicleType
        if (validationErrors.yearsOfExperience) newErrors.yearsOfExperience = validationErrors.yearsOfExperience

        // Also check for empty fields
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
        if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required'
        if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required'
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required'
        break

      case 3: // Address and Emergency Contact
        if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required'
        if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required'
        if (!formData.emergencyContact.name.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required'
        if (!formData.emergencyContact.phone.trim()) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required'
        break

      case 4: // Documents
        console.log('Validating documents:', formData.documents)
        if (!formData.documents.license) newErrors.license = 'Driving license copy is required'
        if (!formData.documents.identityCard) newErrors.identityCard = 'Identity card copy is required'
        break

      case 5: // Terms and Conditions
        if (!formData.terms) newErrors.terms = 'You must accept the terms and conditions'
        if (!formData.dataProcessing) newErrors.dataProcessing = 'You must consent to data processing'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(5)) return

    setIsLoading(true)
    setErrors({})

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('dateOfBirth', formData.dateOfBirth)
      formDataToSend.append('licenseNumber', formData.licenseNumber)
      formDataToSend.append('licenseExpiryDate', formData.licenseExpiryDate)
      formDataToSend.append('vehicleType', formData.vehicleType)
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience)

      // Add address as JSON string
      formDataToSend.append('address', JSON.stringify(formData.address))

      // Add emergency contact as JSON string
      formDataToSend.append('emergencyContact', JSON.stringify(formData.emergencyContact))

      // Add files using the correct field names that match the backend
      Object.keys(formData.documents).forEach(key => {
        if (formData.documents[key]) {
          console.log(`📎 Adding file for ${key}:`, formData.documents[key].name, `(${formData.documents[key].size} bytes)`)
          formDataToSend.append(key, formData.documents[key])
        } else {
          console.log(`📎 No file for ${key}`)
        }
      })

      // Debug: Log what's being sent (including file info)
      console.log('📤 Form data being sent:')
      console.log('📁 Documents in formData:', formData.documents)
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`)
        } else {
          console.log(`${key}:`, value)
        }
      }

      // Use the DriverService for registration
      const data = await DriverService.registerDriver(formDataToSend)

      if (data.success) {
        alert('Your driver application has been submitted successfully! You will receive login credentials via email once your application is approved.')
        navigate('/')
      } else {
        setErrors({ general: data.message || 'Failed to submit application. Please try again.' })
      }

    } catch (error) {
      console.error('Driver application error:', error)
      setErrors({ general: 'Failed to submit application. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Personal Information',
      2: 'Driver & Vehicle Details',
      3: 'Emergency Contact',
      4: 'Documents & Agreement'
    }
    return titles[currentStep]
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-900 to-purple-800 relative overflow-hidden">
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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    Pick & Go
                  </span>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Welcome content */}
          <div className="text-center max-w-md space-y-6">
            <h2 className="text-3xl font-semibold text-white/95 leading-tight">
              Join Our Driver Network
            </h2>
            <p className="text-lg text-purple-100/80 leading-relaxed font-light">
              Start earning with Pick & Go. Complete your driver application and begin your journey to financial independence.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 gap-4 mt-12 w-full max-w-xs">
            <div className="flex items-center space-x-3 text-purple-100/80">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm">Flexible earning opportunities</span>
            </div>
            <div className="flex items-center space-x-3 text-purple-100/80">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm">Safe and secure platform</span>
            </div>
            <div className="flex items-center space-x-3 text-purple-100/80">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">24/7 driver support</span>
            </div>
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
              <Link to="/" className="inline-flex items-center space-x-2 text-3xl font-bold text-purple-600">
                <img
                  src={logo}
                  alt="Pick & Go Logo"
                  className="w-8 h-8 object-contain"
                />
                Pick & Go
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Application</h1>
            <p className="text-gray-600">{getStepTitle()}</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
              1
            </div>
            <div className={`w-6 h-1 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
              2
            </div>
            <div className={`w-6 h-1 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
              3
            </div>
            <div className={`w-6 h-1 ${currentStep >= 4 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 4 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
              4
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('fullName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.fullName || validationErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="John Doe"
                  />
                  {(errors.fullName || validationErrors.fullName) && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName || validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.email || validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="john.doe@example.com"
                  />
                  {(errors.email || validationErrors.email) && (
                    <p className="mt-1 text-sm text-red-600">{errors.email || validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.phone || validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="+94 71 234 5678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Driver's License Number *
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.licenseNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="B1234567"
                  />
                  {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Driver & Vehicle Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">Driver & Vehicle Information</h4>
                  <p className="text-xs text-purple-700">Please provide your driving credentials and preferred vehicle details</p>
                </div>

                <div>
                  <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry Date *
                  </label>
                  <input
                    id="licenseExpiryDate"
                    name="licenseExpiryDate"
                    type="date"
                    required
                    value={formData.licenseExpiryDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.licenseExpiryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {errors.licenseExpiryDate && <p className="mt-1 text-sm text-red-600">{errors.licenseExpiryDate}</p>}
                </div>

                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Vehicle Type *
                  </label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    required
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.vehicleType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>}
                </div>

                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Driving Experience *
                  </label>
                  <input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.yearsOfExperience ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter years of experience"
                  />
                  {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
                </div>

                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors['address.street'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      required
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors['address.city'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      placeholder="Colombo"
                    />
                    {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
                  </div>

                  <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="10100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">Emergency Contact Information</h4>
                  <p className="text-xs text-purple-700">This person will be contacted in case of emergencies during your driving duties</p>
                </div>

                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    type="text"
                    required
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors['emergencyContact.name'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Jane Doe"
                  />
                  {errors['emergencyContact.name'] && <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.name']}</p>}
                </div>

                <div>
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    type="tel"
                    required
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors['emergencyContact.phone'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="+94 71 987 6543"
                  />
                  {errors['emergencyContact.phone'] && <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.phone']}</p>}
                </div>

                <div>
                  <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <select
                    id="emergencyContact.relationship"
                    name="emergencyContact.relationship"
                    required
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors['emergencyContact.relationship'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select relationship</option>
                    {relationshipOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors['emergencyContact.relationship'] && <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.relationship']}</p>}
                </div>
              </div>
            )}

            {/* Step 4: Documents & Agreement */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">Required Documents</h4>
                  <p className="text-xs text-purple-700">Please upload clear, readable copies of all documents. Accepted formats: PDF, JPG, JPEG, PNG (Max 5MB each)</p>
                </div>

                {/* Driver's License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver's License *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {formData.documents.license ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-green-600 font-medium">{formData.documents.license.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, documents: { ...prev.documents, license: null } }))
                            setUploadProgress(prev => ({ ...prev, license: 0 }))
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload('license', e.target.files[0])}
                          className="hidden"
                          id="license-upload"
                        />
                        <label
                          htmlFor="license-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-600">Click to upload driver's license</span>
                        </label>
                      </div>
                    )}
                    {uploadProgress.license !== undefined && uploadProgress.license < 100 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.license}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  {errors.license && <p className="mt-1 text-sm text-red-600">{errors.license}</p>}
                </div>

                {/* Identity Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    National Identity Card *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {formData.documents.identityCard ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-green-600 font-medium">{formData.documents.identityCard.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, documents: { ...prev.documents, identityCard: null } }))
                            setUploadProgress(prev => ({ ...prev, identityCard: 0 }))
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload('identityCard', e.target.files[0])}
                          className="hidden"
                          id="identity-upload"
                        />
                        <label
                          htmlFor="identity-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-600">Click to upload identity card</span>
                        </label>
                      </div>
                    )}
                    {uploadProgress.identityCard !== undefined && uploadProgress.identityCard < 100 && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.identityCard}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  {errors.identityCard && <p className="mt-1 text-sm text-red-600">{errors.identityCard}</p>}
                </div>

                {/* Optional Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Insurance Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Certificate (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                      {formData.documents.insurance ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-green-600 font-medium">{formData.documents.insurance.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, documents: { ...prev.documents, insurance: null } }))
                              setUploadProgress(prev => ({ ...prev, insurance: 0 }))
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload('insurance', e.target.files[0])}
                            className="hidden"
                            id="insurance-upload"
                          />
                          <label
                            htmlFor="insurance-upload"
                            className="cursor-pointer flex flex-col items-center space-y-1"
                          >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs text-gray-600">Upload insurance</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Certificate (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                      {formData.documents.medicalCertificate ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-green-600 font-medium">{formData.documents.medicalCertificate.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, documents: { ...prev.documents, medicalCertificate: null } }))
                              setUploadProgress(prev => ({ ...prev, medicalCertificate: 0 }))
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload('medicalCertificate', e.target.files[0])}
                            className="hidden"
                            id="medical-upload"
                          />
                          <label
                            htmlFor="medical-upload"
                            className="cursor-pointer flex flex-col items-center space-y-1"
                          >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-xs text-gray-600">Upload medical cert</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={formData.terms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      I agree to the{' '}
                      <span className="text-purple-600 hover:text-purple-500 font-medium cursor-pointer">
                        Driver Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="text-purple-600 hover:text-purple-500 font-medium cursor-pointer">
                        Privacy Policy
                      </span>{' '}
                      *
                    </label>
                  </div>
                  {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

                  <div className="flex items-start">
                    <input
                      id="dataProcessing"
                      name="dataProcessing"
                      type="checkbox"
                      checked={formData.dataProcessing}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="dataProcessing" className="ml-2 text-sm text-gray-700">
                      I consent to the processing of my personal data for application review and background checks *
                    </label>
                  </div>
                  {errors.dataProcessing && <p className="text-sm text-red-600">{errors.dataProcessing}</p>}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">What happens next?</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your documents will be reviewed within 3-5 business days</li>
                        <li>Background checks will be conducted</li>
                        <li>You'll receive login credentials via email once approved</li>
                        <li>Complete driver orientation before starting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-4 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>

          {/* Back to home link */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Want to learn more?{' '}
              <Link to="/" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverOnboarding
