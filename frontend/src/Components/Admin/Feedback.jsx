import React, { useState, useEffect } from 'react';
import { motion,  AnimatePresence } from 'framer-motion';

// reference motion to satisfy some linters (used in JSX as <motion.xxx>)
void motion;
import { jsPDF } from 'jspdf'
import watermarkSrc from '../../Assets/2.png'
import FeedbackService from '../../Services/Feedback-service';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    const [attachmentsToView, setAttachmentsToView] = useState([]);

    useEffect(() => {
        fetchFeedbacks();
        fetchStats();
    }, []);

    useEffect(() => {
        let filtered = [...feedbacks];

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(f => f.category === categoryFilter);
        }

        // Severity filter
        if (severityFilter !== 'all') {
            filtered = filtered.filter(f => f.severity === severityFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(f => f.status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.subject?.toLowerCase().includes(query) ||
                f.message?.toLowerCase().includes(query) ||
                f.category?.toLowerCase().includes(query)
            );
        }

        setFilteredFeedbacks(filtered);
    }, [feedbacks, categoryFilter, severityFilter, statusFilter, searchQuery]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const result = await FeedbackService.getFeedback();

            if (result.success) {
                setFeedbacks(result.data || []);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch feedbacks');
            }
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const result = await FeedbackService.getFeedbackStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    

    const handleUpdateSeverity = async (feedbackId, newSeverity) => {
        try {
            setActionLoading(true);
            const result = await FeedbackService.updateFeedbackSeverity(feedbackId, newSeverity);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === feedbackId ? { ...f, severity: newSeverity } : f
                ));
                await fetchStats();
            } else {
                alert(result.message || 'Failed to update severity');
            }
        } catch (err) {
            console.error('Error updating severity:', err);
            alert('Failed to update severity');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (feedbackId, newStatus) => {
        try {
            setActionLoading(true);
            const result = await FeedbackService.updateFeedbackStatus(feedbackId, newStatus);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === feedbackId ? { ...f, status: newStatus } : f
                ));
                await fetchStats();
            } else {
                alert(result.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddResponse = async () => {
        if (!responseText.trim() || !selectedFeedback) {
            alert('Please enter a response message');
            return;
        }

        try {
            setActionLoading(true);
            const result = await FeedbackService.addAdminResponse(selectedFeedback._id, responseText);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === selectedFeedback._id
                        ? { ...f, adminResponse: result.data.adminResponse, status: 'in_progress' }
                        : f
                ));
                setShowResponseModal(false);
                setResponseText('');
                setSelectedFeedback(null);
                await fetchStats();
            } else {
                alert(result.message || 'Failed to add response');
            }
        } catch (err) {
            console.error('Error adding response:', err);
            alert('Failed to add response');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteFeedback = async () => {
        if (!selectedFeedback) return;

        try {
            setActionLoading(true);
            const result = await FeedbackService.deleteFeedback(selectedFeedback._id);

            if (result.success) {
                setFeedbacks(prev => prev.filter(f => f._id !== selectedFeedback._id));
                setShowDeleteConfirm(false);
                setSelectedFeedback(null);
                await fetchStats();
            } else {
                alert(result.message || 'Failed to delete feedback');
            }
        } catch (err) {
            console.error('Error deleting feedback:', err);
            alert('Failed to delete feedback');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolveFeedback = async (feedbackId) => {
        try {
            setActionLoading(true);
            const result = await FeedbackService.resolveFeedback(feedbackId);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === feedbackId ? { ...f, status: 'resolved' } : f
                ));
                await fetchStats();
            } else {
                alert(result.message || 'Failed to resolve feedback');
            }
        } catch (err) {
            console.error('Error resolving feedback:', err);
            alert('Failed to resolve feedback');
        } finally {
            setActionLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            payment: 'bg-blue-100 text-blue-800',
            booking: 'bg-purple-100 text-purple-800',
            login: 'bg-yellow-100 text-yellow-800',
            vehicle_condition: 'bg-orange-100 text-orange-800',
            driver_service: 'bg-green-100 text-green-800',
            general: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.general;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
        };
        return colors[severity] || colors.low;
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-red-100 text-red-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.open;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ----- PDF & CSV helpers -----
    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
        img.src = src
    })

    const createWatermarkDataUrl = async (img, pdfWidthPx, pdfHeightPx, opacity = 0.06) => {
        const canvas = document.createElement('canvas')
        canvas.width = pdfWidthPx
        canvas.height = pdfHeightPx
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * 1.1
        const w = img.width * scale
        const h = img.height * scale
        const x = (canvas.width - w) / 2
        const y = (canvas.height - h) / 2
        ctx.globalAlpha = opacity
        ctx.drawImage(img, x, y, w, h)
        ctx.globalAlpha = 1
        return canvas.toDataURL('image/png')
    }

    // create a small logo dataURL from the source image (keeps aspect ratio)
    const createLogoDataUrl = (img, maxW = 120, maxH = 40) => {
        try {
            const canvas = document.createElement('canvas')
            const ratio = Math.min(maxW / img.width, maxH / img.height, 1)
            const w = Math.round(img.width * ratio)
            const h = Math.round(img.height * ratio)
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, w, h)
            ctx.drawImage(img, 0, 0, w, h)
            return canvas.toDataURL('image/png')
        } catch (e) {
            console.warn('createLogoDataUrl failed', e)
            return null
        }
    }

    // PDF Generation Function   adminpdf
    const generatePdfForEntries = async (entries, filename = null) => {
        if (!entries || entries.length === 0) {
            alert('No entries to export')
            return
        }

        try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' }) //Initialize jsPDF
            const pageWidth = doc.internal.pageSize.getWidth() //Initialize page width 
            const pageHeight = doc.internal.pageSize.getHeight() // Initialize page height
            const margin = 40 // page margin

            // load watermark image and logo
            let watermarkDataUrl = null
            let logoDataUrl = null
            try {
                const img = await loadImage(watermarkSrc)
                watermarkDataUrl = await createWatermarkDataUrl(img, Math.floor(pageWidth), Math.floor(pageHeight), 0.05)
                const logoSmall = createLogoDataUrl(img, 140, 40)
                if (logoSmall) logoDataUrl = logoSmall
            } catch (wErr) {
                console.warn('Watermark/logo load failed', wErr)
            }

            // draw watermark on every page first (will also cover further pages)
            if (watermarkDataUrl) {
                doc.addImage(watermarkDataUrl, 'PNG', 0, 0, pageWidth, pageHeight)
            }

            // document border - gradient effect with double border (blue theme)
            doc.setDrawColor(159, 130, 246) // blue-500
            doc.setLineWidth(2)
            doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 8, 8, 'S')
            doc.setDrawColor(96, 165, 250) // lighter blue
            doc.setLineWidth(0.5)
            doc.roundedRect(16, 16, pageWidth - 32, pageHeight - 32, 6, 6, 'S')

            // header gradient background (simulate with filled rect)
            doc.setFillColor(159, 130, 246) // blue-500
            doc.roundedRect(margin - 10, 30, pageWidth - (margin * 2) + 20, 60, 6, 6, 'F')

            // header: logo (left), title (center), generated date (right)
            const headerY = 58
            if (logoDataUrl) {
                try { doc.addImage(logoDataUrl, 'PNG', margin, headerY - 22) } catch { /* ignore */ }
            }

            doc.setFontSize(20)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(255, 255, 255) // white
            const title = 'Pick & Go — Feedback Report'
            doc.text(title, pageWidth / 2, headerY, { align: 'center' })

            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            const siteName = 'pickandgo.com'
            doc.text(siteName, pageWidth / 2, headerY + 16, { align: 'center' })

            doc.setFontSize(8)
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 5, headerY + 16, { align: 'right' })

            // reset text color
            doc.setTextColor(0, 0, 0)

            // short description
            doc.setFontSize(10)
            doc.setTextColor(75, 85, 99) // gray-600
            const desc = 'Comprehensive feedback export containing user-submitted issues, statuses and admin responses.'
            const descLines = doc.splitTextToSize(desc, pageWidth - margin * 2)
            doc.text(descLines, margin, 110)
            doc.setTextColor(0, 0, 0)

            // start drawing entries below header
            let cursorY = 140

            // helper to draw badge
            const drawBadge = (text, x, y, bgColor) => {
                const padding = 6
                const textWidth = doc.getTextWidth(text)
                const badgeW = textWidth + padding * 2
                const badgeH = 16
                doc.setFillColor(...bgColor)
                doc.roundedRect(x, y - 11, badgeW, badgeH, 3, 3, 'F')
                doc.setTextColor(255, 255, 255)
                doc.setFontSize(8)
                doc.setFont('helvetica', 'bold')
                doc.text(text, x + padding, y)
                doc.setTextColor(0, 0, 0)
                return badgeW + 6
            }

            // category colors
            const categoryColors = {
                payment: [159, 130, 246], // blue
                booking: [168, 85, 247], // purple
                login: [234, 179, 8], // yellow
                vehicle_condition: [249, 115, 22], // orange
                driver_service: [34, 197, 94], // green
                general: [107, 114, 128] // gray
            }

            // severity colors
            const severityColors = {
                low: [34, 197, 94], // green
                medium: [234, 179, 8], // yellow
                high: [249, 115, 22], // orange
                critical: [220, 38, 38] // red
            }

            // status colors
            const statusColors = {
                open: [220, 38, 38], // red
                in_progress: [234, 179, 8], // yellow
                resolved: [34, 197, 94], // green
                closed: [107, 114, 128] // gray
            }

            for (let i = 0; i < entries.length; i++) {
                const e = entries[i]

                // compute available height and add page if needed
                const available = pageHeight - cursorY - margin - 60
                let estimatedHeight = 120
                // approximate message height
                const msgLines = doc.splitTextToSize(e.message || '', pageWidth - margin * 2 - 160)
                estimatedHeight = Math.max(100, 40 + (msgLines.length * 12))
                // admin response lines
                const respLines = e.adminResponse?.message ? doc.splitTextToSize(e.adminResponse.message, pageWidth - margin * 2 - 160) : []
                estimatedHeight += respLines.length * 12

                if (estimatedHeight > available) {
                    // add footer before adding page
                    // add page
                    doc.addPage()
                    // reapply watermark and borders for new page
                    if (watermarkDataUrl) doc.addImage(watermarkDataUrl, 'PNG', 0, 0, pageWidth, pageHeight)
                    doc.setDrawColor(220, 38, 38)
                    doc.setLineWidth(2)
                    doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 8, 8, 'S')
                    doc.setDrawColor(239, 68, 68)
                    doc.setLineWidth(0.5)
                    doc.roundedRect(16, 16, pageWidth - 32, pageHeight - 32, 6, 6, 'S')
                    cursorY = margin + 20
                }

                // draw entry container with severity-based left border accent
                const boxX = margin
                const boxW = pageWidth - margin * 2
                const boxH = Math.max(estimatedHeight, 100)
                
                // severity-based left accent bar
                const sevColor = severityColors[e.severity] || severityColors.low
                doc.setFillColor(...sevColor)
                doc.roundedRect(boxX, cursorY, 6, boxH, 3, 3, 'F')

                // main box
                doc.setDrawColor(229, 231, 235) // gray-200
                doc.setLineWidth(1)
                doc.setFillColor(255, 255, 255)
                doc.roundedRect(boxX, cursorY, boxW, boxH, 8, 8, 'FD')

                // content area
                const contentX = boxX + 20
                let contentY = cursorY + 20

                // subject/title
                doc.setFontSize(13)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(31, 41, 55) // gray-800
                doc.text(e.subject || 'No subject', contentX, contentY)
                contentY += 20

                // badges row: category, severity, status
                let badgeX = contentX
                const cat = (e.category || 'general').replace('_', ' ').toUpperCase()
                const catColor = categoryColors[e.category] || categoryColors.general
                badgeX += drawBadge(cat, badgeX, contentY, catColor)

                const sev = (e.severity || 'low').toUpperCase()
                const sevBadgeColor = severityColors[e.severity] || severityColors.low
                badgeX += drawBadge(sev, badgeX, contentY, sevBadgeColor)

                const stat = (e.status || 'open').replace('_', ' ').toUpperCase()
                const statColor = statusColors[e.status] || statusColors.open
                badgeX += drawBadge(stat, badgeX, contentY, statColor)

                contentY += 18

                // ID and date info
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(107, 114, 128) // gray-500
                const idText = `ID: ${(e._id || '').substring(0, 8)}... | Submitted: ${formatDate(e.createdAt || e.submittedAt)}`
                doc.text(idText, contentX, contentY)
                contentY += 16

                // message body
                doc.setFontSize(10)
                doc.setTextColor(55, 65, 81) // gray-700
                doc.setFont('helvetica', 'normal')
                const msg = doc.splitTextToSize(e.message || '', boxW - 40)
                doc.text(msg, contentX, contentY)
                contentY += msg.length * 12 + 10

                // admin response with colored background
                if (e.adminResponse?.message) {
                    // response box background
                    doc.setFillColor(239, 246, 255) // blue-50
                    const respBox = doc.splitTextToSize(e.adminResponse.message, boxW - 50)
                    doc.roundedRect(contentX - 6, contentY - 6, boxW - 28, (respBox.length * 11) + 20, 4, 4, 'F')
                    
                    doc.setFontSize(9)
                    doc.setFont('helvetica', 'bold')
                    doc.setTextColor(30, 64, 175) // blue-800
                    doc.text('✓ Admin Response:', contentX, contentY + 6)
                    
                    doc.setFont('helvetica', 'normal')
                    doc.setTextColor(55, 65, 81)
                    doc.text(respBox, contentX, contentY + 18)
                    doc.setTextColor(0, 0, 0)
                }

                cursorY += boxH + 18
            }

            // footer: add page numbers and site URL on every page with colored footer bar
            const totalPages = doc.getNumberOfPages()
            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p)
                const footerY = pageHeight - 40
                
                // footer background bar
                doc.setFillColor(248, 250, 252) // gray-50
                doc.rect(margin - 10, footerY - 10, pageWidth - (margin * 2) + 20, 30, 'F')
                
                doc.setFontSize(9)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(100, 116, 139) // gray-500
                doc.text('pickandgo.com | Customer Feedback Management System', margin, footerY + 6)
                
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(220, 38, 38) // red-600
                doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, footerY + 6, { align: 'right' })
                doc.setTextColor(0, 0, 0)
            }

            const outName = filename || `feedback-report-${Date.now()}.pdf` // default filename with date by Date.now() function
            doc.save(outName)
        } catch (err) {
            console.error('PDF generation error', err)
            alert('Failed to generate PDF: ' + (err?.message || err))
        }
    }

    const generatePdfForFeedback = async (feedback) => {
        if (!feedback) return
        await generatePdfForEntries([feedback], `feedback-${feedback._id || Date.now()}.pdf`)
    }



    const downloadCsv = (items) => {
        if (!items || items.length === 0) {
            alert('No items to export')
            return
        }
        const header = ['id','subject','category','severity','status','message','adminResponse','createdAt']
        const rows = items.map(i => [i._id, `"${(i.subject||'').replace(/"/g,'""')}"`, i.category, i.severity, i.status, `"${(i.message||'').replace(/"/g,'""')}"`, `"${(i.adminResponse?.message||'').replace(/"/g,'""')}"`, i.createdAt || ''])
        const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `feedback-export-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    const openAttachments = (feedback) => {
        if (!feedback?.attachments || feedback.attachments.length === 0) {
            alert('No attachments for this feedback')
            return
        }
        setAttachmentsToView(feedback.attachments)
        setShowAttachmentsModal(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading feedbacks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Feedbacks</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFeedbacks}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Management</h1>
                    <p className="text-gray-600">Monitor and respond to customer feedback</p>
                </motion.div>

                {/* Statistics Cards */}
                {stats && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                                </div>
                                <div className="text-4xl">📋</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Resolution Rate</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.resolutionRate || 0}%</p>
                                </div>
                                <div className="text-4xl">✅</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Critical Issues</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.criticalIssues || 0}</p>
                                </div>
                                <div className="text-4xl">🚨</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Open Issues</p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {stats.statusBreakdown?.open || 0}
                                    </p>
                                </div>
                                <div className="text-4xl">⏳</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                <motion.div
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search feedback..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                <option value="payment">Payment</option>
                                <option value="booking">Booking</option>
                                <option value="login">Login</option>
                                <option value="vehicle_condition">Vehicle Condition</option>
                                <option value="driver_service">Driver Service</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        {/* Severity Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="all">All Severities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredFeedbacks.length} of {feedbacks.length} feedback items
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setCategoryFilter('all'); setSeverityFilter('all'); setStatusFilter('all'); setSearchQuery(''); }} className="text-sm text-red-600 hover:text-red-700 font-medium">Clear Filters</button>
                            <button onClick={() => downloadCsv(filteredFeedbacks)} className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-700 hover:bg-gray-200">Export CSV</button>
                            <button onClick={() => generatePdfForEntries(filteredFeedbacks)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Export PDF</button>
                        </div>
                    </div>
                </motion.div>

                {/* Feedback List */}
                <div className="space-y-4">
                    {filteredFeedbacks.length === 0 ? (
                        <motion.div
                            className="bg-white p-12 rounded-xl shadow-md border border-gray-100 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Feedback Found</h3>
                            <p className="text-gray-600">No feedback matches your current filters.</p>
                        </motion.div>
                    ) : (
                        filteredFeedbacks.map((feedback, index) => (
                            <motion.div
                                key={feedback._id || index}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {/* Feedback Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(feedback.category)}`}>
                                                {feedback.category?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Severity:</span>
                                                <select
                                                    value={feedback.severity}
                                                    onChange={(e) => handleUpdateSeverity(feedback._id, e.target.value)}
                                                    disabled={actionLoading}
                                                    className={`text-xs font-semibold px-2 py-1 rounded border-0 ${getSeverityColor(feedback.severity)} text-white cursor-pointer`}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Status:</span>
                                                <select
                                                    value={feedback.status}
                                                    onChange={(e) => handleUpdateStatus(feedback._id, e.target.value)}
                                                    disabled={actionLoading}
                                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(feedback.status)} cursor-pointer`}
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{feedback.subject}</h3>
                                        <p className="text-sm text-gray-600">
                                            Submitted {formatDate(feedback.createdAt || feedback.submittedAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setShowResponseModal(true);
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            💬 Respond
                                        </button>
                                        {feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                                            <button
                                                onClick={() => handleResolveFeedback(feedback._id)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                ✓ Resolve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setShowDeleteConfirm(true);
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Feedback Message */}
                                <div className="mb-4">
                                    <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
                                </div>

                                {/* Admin Response */}
                                {feedback.adminResponse?.message && (
                                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">👤</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">Admin Response:</h4>
                                                <p className="text-gray-700 mb-2">{feedback.adminResponse.message}</p>
                                                <small className="text-gray-500">
                                                    Responded on: {formatDate(feedback.adminResponse.respondedAt || feedback.responseDate)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                        {/* Attachments & Tags */}
                                        <div className="mt-4 flex items-center gap-3">
                                            <button onClick={() => openAttachments(feedback)} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">📎 Attachments</button>
                                            <button onClick={() => generatePdfForFeedback(feedback)} className="text-sm text-sky-600">Export This</button>
                                        </div>

                                        {/* Tags */}
                                {feedback.tags && feedback.tags.length > 0 && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Tags:</span>
                                        {feedback.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Response Modal */}
            <AnimatePresence>
                {showResponseModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !actionLoading && setShowResponseModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Respond to Feedback</h2>

                            {selectedFeedback && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-900 mb-2">{selectedFeedback.subject}</p>
                                    <p className="text-sm text-gray-600">{selectedFeedback.message}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Response *
                                </label>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Enter your response to this feedback..."
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={actionLoading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum 10 characters, maximum 500 characters
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowResponseModal(false);
                                        setResponseText('');
                                        setSelectedFeedback(null);
                                    }}
                                    disabled={actionLoading}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddResponse}
                                    disabled={actionLoading || !responseText.trim() || responseText.length < 10}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Sending...' : 'Send Response'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachments Viewer Modal */}
            <AnimatePresence>
                {showAttachmentsModal && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAttachmentsModal(false)}>
                        <motion.div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attachmentsToView.map((att, i) => (
                                    <div key={i} className="p-3 border rounded-lg">
                                        {att.url && att.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <img src={att.url} alt={att.name || `attachment-${i}`} className="w-full h-48 object-contain" />
                                        ) : (
                                            <div className="flex items-center justify-center h-48 bg-gray-50">{att.name || 'File'}</div>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">{att.name || 'Attachment'}</div>
                                            <a href={att.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-right">
                                <button onClick={() => setShowAttachmentsModal(false)} className="px-4 py-2 bg-gray-100 rounded">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !actionLoading && setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Feedback?</h2>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this inappropriate feedback? This action cannot be undone.
                                </p>
                            </div>

                            {selectedFeedback && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-900 text-sm mb-1">{selectedFeedback.subject}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">{selectedFeedback.message}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setSelectedFeedback(null);
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteFeedback}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminFeedback;
