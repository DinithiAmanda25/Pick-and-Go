import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClientMainHeader from '../../Components/Clients/ClientMainHeader'

function DriverOnboarding() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        // Personal Information
        personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            zipCode: '',
            dateOfBirth: '',
            emergencyContact: '',
            emergencyPhone: ''
        },
        // License Information
        licenseInfo: {
            licenseNumber: '',
            licenseType: '',
            issueDate: '',
            expiryDate: '',
            issuingState: ''
        },
        // Experience Information
        experienceInfo: {
            yearsOfExperience: '',
            previousEmployers: '',
            specialSkills: [],
            vehicleTypes: []
        },
        // Documents
        documents: {
            licensePhoto: null,
            profilePhoto: null,
            backgroundCheck: null,
            references: null
        }
    })

    const navigate = useNavigate()

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const handleFileUpload = (field, file) => {
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [field]: file
            }
        }))
    }

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = () => {
        console.log('Driver application submitted:', formData)
        alert('Your driver application has been submitted successfully! You will be notified once it\'s reviewed.')
        navigate('/driver-dashboard')
    }

    const steps = [
        { number: 1, title: 'Personal Information', description: 'Basic personal details' },
        { number: 2, title: 'License Information', description: 'Driver license details' },
        { number: 3, title: 'Experience & Skills', description: 'Driving experience and skills' },
        { number: 4, title: 'Document Upload', description: 'Upload required documents' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <ClientMainHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.number
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-300 text-gray-400'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span className="text-sm font-semibold">{step.number}</span>
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 w-16 ml-2 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
                        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.personalInfo.firstName}
                                        onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.personalInfo.lastName}
                                        onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.personalInfo.email}
                                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.personalInfo.phone}
                                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.personalInfo.address}
                                        onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your complete address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.personalInfo.city}
                                        onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your city"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.personalInfo.zipCode}
                                        onChange={(e) => handleInputChange('personalInfo', 'zipCode', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your ZIP code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.personalInfo.dateOfBirth}
                                        onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.personalInfo.emergencyContact}
                                        onChange={(e) => handleInputChange('personalInfo', 'emergencyContact', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Emergency contact name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.personalInfo.emergencyPhone}
                                        onChange={(e) => handleInputChange('personalInfo', 'emergencyPhone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Emergency contact phone"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: License Information */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Driver's License Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.licenseInfo.licenseNumber}
                                        onChange={(e) => handleInputChange('licenseInfo', 'licenseNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter license number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        License Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.licenseInfo.licenseType}
                                        onChange={(e) => handleInputChange('licenseInfo', 'licenseType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select license type</option>
                                        <option value="Class A">Class A (Commercial)</option>
                                        <option value="Class B">Class B (Commercial)</option>
                                        <option value="Class C">Class C (Regular)</option>
                                        <option value="Motorcycle">Motorcycle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Issue Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.licenseInfo.issueDate}
                                        onChange={(e) => handleInputChange('licenseInfo', 'issueDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.licenseInfo.expiryDate}
                                        onChange={(e) => handleInputChange('licenseInfo', 'expiryDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Issuing State *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.licenseInfo.issuingState}
                                        onChange={(e) => handleInputChange('licenseInfo', 'issuingState', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter issuing state"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Experience & Skills */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Driving Experience *
                                    </label>
                                    <select
                                        required
                                        value={formData.experienceInfo.yearsOfExperience}
                                        onChange={(e) => handleInputChange('experienceInfo', 'yearsOfExperience', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="1-2 years">1-2 years</option>
                                        <option value="3-5 years">3-5 years</option>
                                        <option value="6-10 years">6-10 years</option>
                                        <option value="10+ years">10+ years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Previous Employers (Optional)
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData.experienceInfo.previousEmployers}
                                        onChange={(e) => handleInputChange('experienceInfo', 'previousEmployers', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="List previous driving-related employers"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Special Skills (Select all that apply)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {['Night Driving', 'Long Distance', 'City Navigation', 'Highway Driving', 'Defensive Driving', 'Customer Service'].map((skill) => (
                                        <label key={skill} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.experienceInfo.specialSkills.includes(skill)}
                                                onChange={(e) => {
                                                    const skills = formData.experienceInfo.specialSkills
                                                    if (e.target.checked) {
                                                        handleInputChange('experienceInfo', 'specialSkills', [...skills, skill])
                                                    } else {
                                                        handleInputChange('experienceInfo', 'specialSkills', skills.filter(s => s !== skill))
                                                    }
                                                }}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vehicle Types You Can Drive (Select all that apply)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {['Sedan', 'SUV', 'Van', 'Truck', 'Luxury Car', 'Motorcycle'].map((type) => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.experienceInfo.vehicleTypes.includes(type)}
                                                onChange={(e) => {
                                                    const types = formData.experienceInfo.vehicleTypes
                                                    if (e.target.checked) {
                                                        handleInputChange('experienceInfo', 'vehicleTypes', [...types, type])
                                                    } else {
                                                        handleInputChange('experienceInfo', 'vehicleTypes', types.filter(t => t !== type))
                                                    }
                                                }}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Document Upload */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Driver's License Photo *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileUpload('licensePhoto', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Upload clear photo of both sides of your license</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profile Photo *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Upload a professional headshot</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Background Check (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileUpload('backgroundCheck', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Upload background check certificate if available</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        References (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileUpload('references', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Upload reference letters from previous employers</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Your documents will be reviewed by our business owners. You will be notified once your application is approved and you can start accepting rides.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-8 border-t border-gray-200">
                        <button
                            onClick={handlePrevStep}
                            disabled={currentStep === 1}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${currentStep === 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            Previous
                        </button>

                        {currentStep < 4 ? (
                            <button
                                onClick={handleNextStep}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Submit Application
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modern Professional Footer - Same as other pages */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative">
                    {/* Main Footer Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 16.5a1.5 1.5 0 01-3 0V14h.5a.5.5 0 01.5.5v1.5zM15 16.5a1.5 1.5 0 01-3 0V14h.5a.5.5 0 01.5.5v1.5z" />
                                            <path fillRule="evenodd" d="M2 12a5 5 0 015-5h6a5 5 0 110 10H7a5 5 0 01-5-5zm5-3a3 3 0 100 6h6a3 3 0 100-6H7z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                        Pick & Go
                                    </h3>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    Join our team of professional drivers and become part of the Pick & Go family. Drive with flexibility, earn with confidence.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Driver Resources */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Driver Resources</h4>
                                <ul className="space-y-3">
                                    <li><Link to="/driver-requirements" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Requirements
                                    </Link></li>
                                    <li><Link to="/driver-benefits" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Benefits
                                    </Link></li>
                                    <li><Link to="/driver-training" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Training
                                    </Link></li>
                                    <li><Link to="/driver-support" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Support
                                    </Link></li>
                                    <li><Link to="/driver-faq" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        FAQ
                                    </Link></li>
                                </ul>
                            </div>

                            {/* Services */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Services</h4>
                                <ul className="space-y-3">
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Car Rental
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Driver Service
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Business Rentals
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Airport Transfer
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Event Services
                                    </a></li>
                                </ul>
                            </div>

                            {/* Driver Contact */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Driver Support</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Need help with your application? Our driver support team is here to assist you.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-sm">Driver Hotline: (555) 123-DRIVE</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-300">
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm">drivers@pickandgo.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <div className="text-gray-300 text-sm">
                                    © 2024 Pick & Go. All rights reserved. | Drive with us and shape the future of mobility
                                </div>
                                <div className="flex space-x-6 text-sm">
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Driver Terms</a>
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Driver Agreement</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default DriverOnboarding
