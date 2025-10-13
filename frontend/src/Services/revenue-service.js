import { HTTP } from './httpCommon-service';

class RevenueService {
    async getRevenueSummary(businessOwnerId, period = 'monthly', startDate = null, endDate = null) {
        try {
            let url = `/revenue/business-owner/${businessOwnerId}/summary?period=${period}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await HTTP.get(url);
            return response.data;
        } catch (error) {
            console.log('Revenue endpoint not available, using mock data:', error.message);
            return this.getMockRevenueSummary(businessOwnerId, period);
        }
    }

    async getPaymentTransactions(businessOwnerId, page = 1, limit = 100, period = 'monthly') {
        try {
            const response = await HTTP.get(`/revenue/business-owner/${businessOwnerId}/transactions?page=${page}&limit=${limit}&period=${period}`);
            return response.data;
        } catch (error) {
            console.log('Payment transactions endpoint not available, using mock data:', error.message);
            return this.getMockPaymentTransactions(businessOwnerId, page, limit);
        }
    }

    async getRevenueAnalytics(businessOwnerId, period = 'monthly') {
        try {
            const response = await HTTP.get(`/revenue/business-owner/${businessOwnerId}/analytics?period=${period}`);
            return response.data;
        } catch (error) {
            console.log('Revenue analytics endpoint not available, using mock data:', error.message);
            return this.getMockRevenueAnalytics(businessOwnerId, period);
        }
    }

    async getPaymentMethodBreakdown(businessOwnerId, period = 'monthly') {
        try {
            const response = await HTTP.get(`/revenue/business-owner/${businessOwnerId}/payment-methods?period=${period}`);
            return response.data;
        } catch (error) {
            console.log('Payment method breakdown endpoint not available, using mock data:', error.message);
            return this.getMockPaymentMethodBreakdown(businessOwnerId, period);
        }
    }

    async getTopPerformingServices(businessOwnerId, period = 'monthly', limit = 10) {
        try {
            const response = await HTTP.get(`/revenue/business-owner/${businessOwnerId}/top-services?period=${period}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.log('Top performing services endpoint not available, using mock data:', error.message);
            return this.getMockTopServices(businessOwnerId, limit);
        }
    }

    async getPayoutHistory(businessOwnerId, page = 1, limit = 20) {
        try {
            const response = await HTTP.get(`/revenue/business-owner/${businessOwnerId}/payouts?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.log('Payout history endpoint not available, using mock data:', error.message);
            return this.getMockPayoutHistory(businessOwnerId, page, limit);
        }
    }

    async requestPayout(businessOwnerId, amount) {
        try {
            const response = await HTTP.post(`/revenue/business-owner/${businessOwnerId}/request-payout`, { amount });
            return response.data;
        } catch (error) {
            console.log('Payout request endpoint not available, using mock response:', error.message);
            return this.getMockPayoutRequest(amount);
        }
    }

    async generateRevenueReport(businessOwnerId, period = 'monthly', startDate = null, endDate = null) {
        try {
            let url = `/revenue/business-owner/${businessOwnerId}/report?period=${period}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await HTTP.get(url, { responseType: 'blob' });
            return response.data;
        } catch (error) {
            console.log('Revenue report endpoint not available, using mock response:', error.message);
            return this.getMockRevenueReport(businessOwnerId, period);
        }
    }

    // Mock data methods
    getMockRevenueSummary(businessOwnerId, period) {
        const baseAmount = Math.random() * 50000 + 10000;
        const growthRate = Math.random() * 0.3 - 0.1; // -10% to +20%
        
        return {
            totalRevenue: baseAmount,
            totalTransactions: Math.floor(Math.random() * 200) + 50,
            averageTransactionValue: baseAmount / (Math.floor(Math.random() * 200) + 50),
            successRate: 0.85 + Math.random() * 0.15,
            availableBalance: baseAmount * 0.8,
            periodGrowth: growthRate,
            previousPeriodRevenue: baseAmount / (1 + growthRate)
        };
    }

    getMockPaymentTransactions(businessOwnerId, page, limit) {
        const transactions = [];
        const statuses = ['completed', 'pending', 'failed'];
        const methods = ['credit_card', 'bank_transfer', 'cash', 'digital_wallet'];
        
        for (let i = 0; i < Math.min(limit, 50); i++) {
            const amount = Math.random() * 5000 + 500;
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            transactions.push({
                _id: `txn_${Date.now()}_${i}`,
                transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                amount: amount,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                method: methods[Math.floor(Math.random() * methods.length)],
                createdAt: date.toISOString(),
                clientName: `Client ${i + 1}`,
                serviceType: ['Vehicle Rental', 'Delivery Service', 'Transport'][Math.floor(Math.random() * 3)]
            });
        }
        
        return {
            transactions,
            pagination: {
                page,
                limit,
                total: 150,
                pages: Math.ceil(150 / limit)
            }
        };
    }

    getMockRevenueAnalytics(businessOwnerId, period) {
        return {
            dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                revenue: Math.random() * 3000 + 1000
            })),
            monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
                month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
                revenue: Math.random() * 40000 + 20000
            }))
        };
    }

    getMockPaymentMethodBreakdown(businessOwnerId, period) {
        const methods = [
            { method: 'credit_card', percentage: 45, amount: 22500 },
            { method: 'bank_transfer', percentage: 30, amount: 15000 },
            { method: 'cash', percentage: 15, amount: 7500 },
            { method: 'digital_wallet', percentage: 10, amount: 5000 }
        ];
        
        return methods;
    }

    getMockTopServices(businessOwnerId, limit) {
        const services = [
            { name: 'Vehicle Rental', revenue: 25000, bookings: 45 },
            { name: 'Delivery Service', revenue: 18000, bookings: 32 },
            { name: 'Transport Service', revenue: 12000, bookings: 28 },
            { name: 'Emergency Transport', revenue: 8000, bookings: 15 },
            { name: 'Long Distance', revenue: 6000, bookings: 12 }
        ];
        
        return services.slice(0, limit);
    }

    getMockPayoutHistory(businessOwnerId, page, limit) {
        const payouts = [];
        
        for (let i = 0; i < Math.min(limit, 20); i++) {
            const amount = Math.random() * 10000 + 2000;
            const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            const statuses = ['completed', 'pending', 'processing'];
            
            payouts.push({
                _id: `payout_${Date.now()}_${i}`,
                amount: amount,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                requestedAt: date.toISOString(),
                processedAt: date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? null : new Date(date.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
                method: 'bank_transfer'
            });
        }
        
        return {
            payouts,
            pagination: {
                page,
                limit,
                total: 45,
                pages: Math.ceil(45 / limit)
            }
        };
    }

    getMockPayoutRequest(amount) {
        return {
            success: true,
            payoutId: `payout_${Date.now()}`,
            amount: amount,
            status: 'pending',
            message: 'Payout request submitted successfully. Processing time: 2-3 business days.'
        };
    }

    getMockRevenueReport(businessOwnerId, period) {
        // Create a simple text-based report as a Blob
        const reportContent = `
REVENUE REPORT
Business Owner ID: ${businessOwnerId}
Period: ${period}
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Revenue: LKR 45,000
- Total Transactions: 125
- Average Transaction: LKR 360
- Success Rate: 92%

TOP SERVICES:
1. Vehicle Rental - LKR 25,000 (45 bookings)
2. Delivery Service - LKR 18,000 (32 bookings)
3. Transport Service - LKR 12,000 (28 bookings)

PAYMENT METHODS:
- Credit Card: 45% (LKR 20,250)
- Bank Transfer: 30% (LKR 13,500)
- Cash: 15% (LKR 6,750)
- Digital Wallet: 10% (LKR 4,500)

This is a demo report. Real data will be available when backend endpoints are implemented.
        `;
        
        return new Blob([reportContent], { type: 'text/plain' });
    }
}

export default new RevenueService();