import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            Pick & Go
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link to="/driver-dashboard" className="text-gray-600 hover:text-blue-600">
                                Dashboard
                            </Link>
                            <Link to="/login" className="text-gray-600 hover:text-blue-600">
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

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
                            className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${currentStep === 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                        >
                            Previous
                        </button>

                        {currentStep < 4 ? (
                            <button
                                onClick={handleNextStep}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-300"
                            >
                                Submit Application
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverOnboarding
