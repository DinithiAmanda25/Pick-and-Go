import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ClientMainHeader from '../../Components/Clients/ClientMainHeader'

function Invoice() {
<<<<<<< Updated upstream
    const { id } = useParams()
    const location = useLocation()
    const bookingData = location.state

    const handleDownloadInvoice = () => {
        // Mock download functionality
        alert('Invoice downloaded successfully!')
=======
    const { id } = useParams();
    const location = useLocation();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                // If we have booking data passed via state, use it
                if (location.state?.booking) {
                    setBooking(location.state.booking);
                    setLoading(false);
                    return;
                }
                
                // Otherwise fetch from API using the ID
                if (id) {
                    const response = await getBookingDetails(id);
                    if (response.success) {
                        setBooking(response.booking);
                    } else {
                        setError(response.message || 'Failed to fetch booking details');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch booking details:', error);
                setError('Failed to load invoice. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id, location]);

    const handleDownloadInvoice = async () => {
        setDownloading(true);
        try {
            // Check if html2pdf is already loaded
            if (window.html2pdf) {
                generatePDF();
                return;
            }

            // Load html2pdf library dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
            
            script.onload = () => {
                generatePDF();
            };

            script.onerror = () => {
                setDownloading(false);
                // Fallback: Use browser's print to PDF
                const useFallback = window.confirm(
                    'Failed to load PDF generator. Would you like to use the browser\'s print to PDF feature instead?'
                );
                if (useFallback) {
                    // Trigger print dialog with PDF option
                    window.print();
                }
            };
        } catch (error) {
            console.error('Download error:', error);
            setDownloading(false);
            alert('Failed to download receipt. Please try again.');
        }
    };

    const generatePDF = () => {
        // Get the invoice content
        let invoiceElement = document.querySelector('.invoice-content');
        if (!invoiceElement) {
            setDownloading(false);
            alert('Invoice content not found');
            return;
        }

        // Create a clean copy for PDF generation to avoid styling issues
        const cleanElement = invoiceElement.cloneNode(true);
        
        // Remove problematic elements and fix styles
        cleanElement.style.fontFamily = 'Arial, sans-serif';
        cleanElement.style.color = '#000000';
        cleanElement.style.backgroundColor = '#ffffff';
        
        // Remove any SVG elements that might cause issues
        const svgElements = cleanElement.querySelectorAll('svg');
        svgElements.forEach(svg => {
            // Replace with simple text or remove
            svg.parentNode.removeChild(svg);
        });

        // Fix any problematic CSS classes
        const allElements = cleanElement.querySelectorAll('*');
        allElements.forEach(el => {
            // Remove Tailwind classes that might cause issues
            el.className = el.className.replace(/text-\w+-\d+/g, '').replace(/bg-\w+-\d+/g, '').replace(/border-\w+-\d+/g, '');
            
            // Set safe inline styles
            if (el.tagName === 'H1' || el.tagName === 'H2') {
                el.style.color = '#2563eb';
                el.style.fontWeight = 'bold';
            } else if (el.tagName === 'P') {
                el.style.color = '#374151';
            }
        });

        // Temporarily add to document
        cleanElement.style.position = 'absolute';
        cleanElement.style.left = '-9999px';
        cleanElement.style.top = '0';
        document.body.appendChild(cleanElement);

        // Configure PDF options with simplified settings to avoid issues
        const options = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `receipt-${booking.bookingReference}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
                scale: 1, // Use scale 1 to avoid rendering issues
                useCORS: true,
                letterRendering: true,
                backgroundColor: '#ffffff',
                allowTaint: false,
                foreignObjectRendering: false,
                logging: false, // Disable logging to reduce console errors
                removeContainer: true
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait' 
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate and download PDF
        window.html2pdf()
            .set(options)
            .from(cleanElement)
            .save()
            .then(() => {
                // Clean up the temporary element
                document.body.removeChild(cleanElement);
                setDownloading(false);
                
                // Show success message
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                notification.innerHTML = `
                    <div class="flex items-center">
                        <span class="w-5 h-5 mr-2 text-lg">✓</span>
                        Receipt downloaded successfully!
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            })
            .catch((error) => {
                console.error('PDF generation failed:', error);
                // Clean up the temporary element
                if (document.body.contains(cleanElement)) {
                    document.body.removeChild(cleanElement);
                }
                setDownloading(false);
                
                // Try fallback method
                const useFallback = window.confirm(
                    'PDF generation failed. Would you like to try the browser\'s print to PDF instead?'
                );
                if (useFallback) {
                    window.print();
                } else {
                    // Try creating a simple HTML version
                    generateSimpleHTMLPDF();
                }
            });
    };

    const generateSimpleHTMLPDF = () => {
        // Create a very simple HTML version for PDF generation
        const simpleHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Receipt - ${booking.bookingReference}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .invoice-title { font-size: 20px; margin-top: 10px; }
                    .section { margin: 20px 0; }
                    .section h3 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
                    .info-row { margin: 8px 0; }
                    .label { font-weight: bold; display: inline-block; width: 150px; }
                    .total { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 20px; }
                    .footer { margin-top: 40px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">Pick & Go</div>
                    <div>Vehicle Rental Services</div>
                    <div>123 Main Street, City, State 12345</div>
                    <div>Phone: (555) 123-4567 | Email: info@pickandgo.com</div>
                    <div class="invoice-title">RECEIPT</div>
                </div>

                <div class="section">
                    <h3>Invoice Information</h3>
                    <div class="info-row"><span class="label">Invoice #:</span> ${booking.bookingReference}</div>
                    <div class="info-row"><span class="label">Date:</span> ${new Date(booking.createdAt).toLocaleDateString()}</div>
                    <div class="info-row"><span class="label">Status:</span> ${booking.status.toUpperCase()}</div>
                </div>

                <div class="section">
                    <h3>Customer Information</h3>
                    <div class="info-row"><span class="label">Name:</span> ${booking.clientId?.firstName} ${booking.clientId?.lastName}</div>
                    <div class="info-row"><span class="label">Email:</span> ${booking.clientId?.email}</div>
                    <div class="info-row"><span class="label">Phone:</span> ${booking.clientId?.phone}</div>
                </div>

                <div class="section">
                    <h3>Vehicle Details</h3>
                    <div class="info-row"><span class="label">Vehicle:</span> ${booking.vehicleId?.make} ${booking.vehicleId?.model} (${booking.vehicleId?.year})</div>
                    <div class="info-row"><span class="label">License Plate:</span> ${booking.vehicleId?.licensePlate}</div>
                    <div class="info-row"><span class="label">Color:</span> ${booking.vehicleId?.color}</div>
                </div>

                <div class="section">
                    <h3>Rental Period</h3>
                    <div class="info-row"><span class="label">Start Date:</span> ${new Date(booking.rentalPeriod.startDate).toLocaleDateString()}</div>
                    <div class="info-row"><span class="label">End Date:</span> ${new Date(booking.rentalPeriod.endDate).toLocaleDateString()}</div>
                    <div class="info-row"><span class="label">Duration:</span> ${rentalDays} day(s)</div>
                </div>

                <div class="section">
                    <h3>Locations</h3>
                    <div class="info-row"><span class="label">Pickup:</span> ${booking.pickupLocation?.address}, ${booking.pickupLocation?.city}</div>
                    <div class="info-row"><span class="label">Dropoff:</span> ${booking.dropoffLocation?.address}, ${booking.dropoffLocation?.city}</div>
                </div>

                <div class="section">
                    <h3>Payment Information</h3>
                    <div class="info-row"><span class="label">Payment Method:</span> ${booking.payment?.method || 'N/A'}</div>
                    <div class="info-row"><span class="label">Payment Status:</span> ${booking.payment?.status || 'N/A'}</div>
                    <div class="info-row"><span class="label">Transaction ID:</span> ${booking.payment?.transactionId || 'N/A'}</div>
                    <div class="total">Total Amount: LKR ${booking.payment?.paidAmount || booking.pricing?.totalAmount || 0}</div>
                </div>

                <div class="footer">
                    <p>Thank you for choosing Pick & Go!</p>
                    <p>For support, contact: info@pickandgo.com</p>
                </div>
            </body>
            </html>
        `;

        // Create a new window with the simple HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.write(simpleHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const handleDownloadTextReceipt = () => {
        // Calculate rental days if not already calculated
        const startDate = new Date(booking.rentalPeriod.startDate);
        const endDate = new Date(booking.rentalPeriod.endDate);
        const calculatedRentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Generate a simple text receipt as fallback
        const receiptText = `
PICK & GO - VEHICLE RENTAL RECEIPT
=====================================

Invoice #: ${booking.bookingReference}
Date: ${new Date(booking.createdAt).toLocaleDateString()}
Status: ${booking.status.toUpperCase()}

CUSTOMER INFORMATION:
--------------------
Name: ${booking.clientId?.firstName} ${booking.clientId?.lastName}
Email: ${booking.clientId?.email}
Phone: ${booking.clientId?.phone}

VEHICLE DETAILS:
----------------
Vehicle: ${booking.vehicleId?.make} ${booking.vehicleId?.model} (${booking.vehicleId?.year})
License Plate: ${booking.vehicleId?.licensePlate}
Color: ${booking.vehicleId?.color}

RENTAL PERIOD:
--------------
Start Date: ${new Date(booking.rentalPeriod.startDate).toLocaleDateString()}
End Date: ${new Date(booking.rentalPeriod.endDate).toLocaleDateString()}
Duration: ${calculatedRentalDays} day(s)

PICKUP & DROPOFF:
-----------------
Pickup: ${booking.pickupLocation?.address}, ${booking.pickupLocation?.city}
Dropoff: ${booking.dropoffLocation?.address}, ${booking.dropoffLocation?.city}

PRICING BREAKDOWN:
------------------
Base Rate: LKR ${booking.pricing?.baseRate || 0}
Duration: ${calculatedRentalDays} days
Subtotal: LKR ${booking.pricing?.subtotal || 0}
Additional Services: LKR ${booking.pricing?.additionalServices || 0}
Taxes: LKR ${booking.pricing?.taxes || 0}
TOTAL: LKR ${booking.payment?.paidAmount || booking.pricing?.totalAmount || 0}

PAYMENT INFORMATION:
-------------------
Payment Method: ${booking.payment?.method || 'N/A'}
Payment Status: ${booking.payment?.status || 'N/A'}
Transaction ID: ${booking.payment?.transactionId || 'N/A'}

Thank you for choosing Pick & Go!
For support, contact: info@pickandgo.com
        `.trim();

        // Create and download text file
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${booking.bookingReference}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
>>>>>>> Stashed changes
    }

    const handlePrint = () => {
        window.print()
    }

    if (!bookingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h2>
                    <Link to="/client-dashboard" className="text-blue-600 hover:text-blue-800">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <ClientMainHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 print:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-green-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">Booking Confirmed!</h3>
                                <p className="text-green-700">Your vehicle rental has been successfully booked. Please save this invoice for your records.</p>
                            </div>
                        </div>

                        {/* Print and Download Buttons */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handlePrint}
                                className="text-gray-600 hover:text-blue-600 flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
                            
                            {/* Download Dropdown */}
                            <div className="relative">
                            <button
                                    disabled={downloading}
                                    className={`px-6 py-2 rounded-lg flex items-center shadow-lg transition-all duration-200 ${
                                        downloading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'
                                    } text-white`}
                                onClick={handleDownloadInvoice}
                                >
                                    {downloading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                            Download PDF
                                        </>
                                    )}
                                </button>
                                
                                {/* Alternative download options */}
                                <div className="mt-2 space-y-1">
                                    <button
                                        onClick={handleDownloadTextReceipt}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline block"
                                        title="Download as text file"
                                    >
                                        Download as text
                                    </button>
                                    <button
                                        onClick={generateSimpleHTMLPDF}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline block"
                                        title="Simple HTML version for printing"
                                    >
                                        Simple print version
                            </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice */}
                <div className="invoice-content bg-white rounded-xl shadow-lg p-8" style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: '1.6',
                    color: '#374151'
                }}>
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600 mb-2">Pick & Go</h1>
                            <p className="text-gray-600">Vehicle Rental Services</p>
                            <p className="text-gray-600">123 Main Street, City, State 12345</p>
                            <p className="text-gray-600">Phone: (555) 123-4567</p>
                            <p className="text-gray-600">Email: info@pickandgo.com</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
                            <p className="text-gray-600"><strong>Invoice #:</strong> INV-{bookingData.id}</p>
                            <p className="text-gray-600"><strong>Date:</strong> {new Date(bookingData.bookingDate).toLocaleDateString()}</p>
                            <p className="text-gray-600"><strong>Status:</strong>
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                    {bookingData.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                            <p className="text-gray-700"><strong>{bookingData.customerInfo.firstName} {bookingData.customerInfo.lastName}</strong></p>
                            <p className="text-gray-600">{bookingData.customerInfo.address}</p>
                            <p className="text-gray-600">{bookingData.customerInfo.city}, {bookingData.customerInfo.zipCode}</p>
                            <p className="text-gray-600">Email: {bookingData.customerInfo.email}</p>
                            <p className="text-gray-600">Phone: {bookingData.customerInfo.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method:</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">Credit Card</p>
                                <p className="text-gray-600">**** **** **** {bookingData.paymentInfo.cardNumber.slice(-4)}</p>
                                <p className="text-gray-600">{bookingData.paymentInfo.nameOnCard}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rental Details */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>

                        {/* Vehicle */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-4">
                            <div className="flex items-start space-x-4">
                                <img
                                    src={bookingData.vehicle.image}
                                    alt={bookingData.vehicle.name}
                                    className="w-24 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900">{bookingData.vehicle.name}</h4>
                                    <div className="flex items-center mt-1">
                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{bookingData.vehicle.rating}</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {bookingData.vehicle.features.map((feature, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Driver (if applicable) */}
                        {bookingData.withDriver && bookingData.driver && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={bookingData.driver.image}
                                        alt={bookingData.driver.name}
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">Driver: {bookingData.driver.name}</h4>
                                        <div className="flex items-center mt-1">
                                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">{bookingData.driver.rating}</span>
                                            <span className="text-sm text-gray-600 ml-4">Experience: {bookingData.driver.experience}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Billing Summary */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 text-gray-700">Description</th>
                                        <th className="text-right py-2 text-gray-700">Quantity</th>
                                        <th className="text-right py-2 text-gray-700">Rate</th>
                                        <th className="text-right py-2 text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Vehicle Rental - {bookingData.vehicle.name}</td>
                                        <td className="text-right py-3 text-gray-600">{bookingData.rentalDays} day(s)</td>
                                        <td className="text-right py-3 text-gray-600">${bookingData.vehicle.pricePerDay}</td>
                                        <td className="text-right py-3 text-gray-900">${bookingData.vehicle.pricePerDay * bookingData.rentalDays}</td>
                                    </tr>
                                    {bookingData.withDriver && bookingData.driver && (
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 text-gray-900">Driver Service - {bookingData.driver.name}</td>
                                            <td className="text-right py-3 text-gray-600">{bookingData.rentalDays} day(s)</td>
                                            <td className="text-right py-3 text-gray-600">${bookingData.driver.pricePerDay}</td>
                                            <td className="text-right py-3 text-gray-900">${bookingData.driver.pricePerDay * bookingData.rentalDays}</td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Service Fee</td>
                                        <td className="text-right py-3 text-gray-600">1</td>
                                        <td className="text-right py-3 text-gray-600">$5</td>
                                        <td className="text-right py-3 text-gray-900">$5</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Insurance</td>
                                        <td className="text-right py-3 text-gray-600">1</td>
                                        <td className="text-right py-3 text-gray-600">$10</td>
                                        <td className="text-right py-3 text-gray-900">$10</td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-300">
                                        <td className="py-3 text-lg font-semibold text-gray-900" colSpan="3">Total Amount</td>
                                        <td className="text-right py-3 text-lg font-bold text-blue-600">${bookingData.totalAmount + 15}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>• Vehicle must be returned in the same condition as received</p>
                            <p>• Late returns may incur additional charges</p>
                            <p>• Customer is responsible for any traffic violations during rental period</p>
                            <p>• Full payment must be settled before vehicle pickup</p>
                            <p>• Cancellations made 24 hours in advance are eligible for full refund</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-8 mt-8 text-center">
                        <p className="text-gray-600">Thank you for choosing Pick & Go!</p>
                        <p className="text-sm text-gray-500 mt-2">
                            For any queries, contact us at support@pickandgo.com or call (555) 123-4567
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-8 print:hidden">
                    <Link
                        to="/client-dashboard"
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/vehicle-rental"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Book Another Vehicle
                    </Link>
                </div>
            </div>

            {/* Modern Professional Footer - Same as other pages */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white relative overflow-hidden print:hidden">
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
                                    Your trusted partner for premium vehicle rentals. Experience comfort, reliability, and exceptional service with every journey.
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

                            {/* Quick Links */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Quick Links</h4>
                                <ul className="space-y-3">
                                    <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        About Us
                                    </Link></li>
                                    <li><Link to="/vehicle-rental" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Our Fleet
                                    </Link></li>
                                    <li><Link to="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Pricing
                                    </Link></li>
                                    <li><Link to="/locations" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Locations
                                    </Link></li>
                                    <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Contact Us
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

                            {/* Newsletter */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Stay Updated</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Subscribe to our newsletter for exclusive deals and latest updates.
                                </p>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <div className="text-gray-300 text-sm">
                                    © 2024 Pick & Go. All rights reserved. | Designed with ❤️ for better mobility
                                </div>
                                <div className="flex space-x-6 text-sm">
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</a>
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Cookie Policy</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Invoice
