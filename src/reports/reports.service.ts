import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParcelStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        // Total shipments
        const totalShipments = await this.prisma.parcel.count();
        const lastMonthShipments = await this.prisma.parcel.count({
            where: { createdAt: { gte: lastMonth } },
        });
        const previousMonthShipments = totalShipments - lastMonthShipments;
        const shipmentsGrowth = previousMonthShipments > 0
            ? ((lastMonthShipments - previousMonthShipments) / previousMonthShipments) * 100
            : 0;

        // Revenue
        const totalRevenue = await this.prisma.payment.aggregate({
            _sum: { amount: true },
        });
        const lastMonthRevenue = await this.prisma.payment.aggregate({
            where: { createdAt: { gte: lastMonth } },
            _sum: { amount: true },
        });
        const previousMonthRevenue = (totalRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0);
        const revenueGrowth = previousMonthRevenue > 0
            ? (((lastMonthRevenue._sum.amount || 0) - previousMonthRevenue) / previousMonthRevenue) * 100
            : 0;

        // Active deliveries (in transit)
        const activeDeliveries = await this.prisma.parcel.count({
            where: {
                status: {
                    in: [
                        ParcelStatus.IN_TRANSIT_USA,
                        ParcelStatus.DEPARTED_USA,
                        ParcelStatus.IN_TRANSIT_HAITI,
                    ],
                },
            },
        });

        // Ready for pickup
        const readyForPickup = await this.prisma.parcel.count({
            where: { status: ParcelStatus.READY_FOR_PICKUP },
        });

        // Pending tasks (parcels that need attention)
        const pendingTasks = await this.prisma.parcel.count({
            where: {
                OR: [
                    { status: ParcelStatus.PENDING },
                    { status: ParcelStatus.ARRIVED_HAITI, paymentStatus: PaymentStatus.PENDING },
                ],
            },
        });

        // Urgent issues (parcels on hold or cancelled)
        const urgentIssues = await this.prisma.parcel.count({
            where: { status: ParcelStatus.CANCELLED },
        });

        return {
            totalShipments: {
                value: totalShipments,
                growth: Math.round(shipmentsGrowth * 10) / 10,
            },
            revenue: {
                value: totalRevenue._sum.amount || 0,
                growth: Math.round(revenueGrowth * 10) / 10,
            },
            activeDeliveries: {
                value: activeDeliveries,
                readyForPickup,
            },
            pendingTasks: {
                value: pendingTasks,
                urgentIssues,
            },
        };
    }

    /**
     * Get shipping volume by day for the last 7 days
     */
    async getShippingVolume(days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const parcels = await this.prisma.parcel.findMany({
            where: {
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
            },
        });

        // Group by day
        const volumeByDay: { [key: string]: number } = {};
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = dayNames[date.getDay()];
            const dateKey = date.toISOString().split('T')[0];
            volumeByDay[dateKey] = 0;
        }

        parcels.forEach((parcel) => {
            const dateKey = parcel.createdAt.toISOString().split('T')[0];
            if (volumeByDay[dateKey] !== undefined) {
                volumeByDay[dateKey]++;
            }
        });

        return Object.entries(volumeByDay).map(([date, count], index) => {
            const d = new Date(date);
            return {
                day: dayNames[d.getDay()],
                count,
                date,
            };
        });
    }

    /**
     * Get revenue report by period
     */
    async getRevenueReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const payments = await this.prisma.payment.findMany({
            where,
            include: {
                parcel: {
                    select: {
                        trackingNumber: true,
                        customer: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const byMethod = payments.reduce((acc, p) => {
            acc[p.method] = (acc[p.method] || 0) + p.amount;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalRevenue,
            totalTransactions: payments.length,
            byMethod,
            payments: payments.map((p) => ({
                id: p.id,
                amount: p.amount,
                method: p.method,
                date: p.createdAt,
                trackingNumber: p.parcel.trackingNumber,
                customerName: `${p.parcel.customer.firstName} ${p.parcel.customer.lastName}`,
            })),
        };
    }

    /**
     * Get shipment status breakdown
     */
    async getShipmentStatusBreakdown() {
        const statuses = await this.prisma.parcel.groupBy({
            by: ['status'],
            _count: true,
        });

        return statuses.map((s) => ({
            status: s.status,
            count: s._count,
        }));
    }

    /**
     * Get top customers by shipment count
     */
    async getTopCustomers(limit: number = 10) {
        const customers = await this.prisma.customer.findMany({
            include: {
                _count: {
                    select: { parcels: true },
                },
                parcels: {
                    select: {
                        totalAmount: true,
                    },
                },
            },
            orderBy: {
                parcels: {
                    _count: 'desc',
                },
            },
            take: limit,
        });

        return customers.map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            customAddress: c.customAddress,
            totalShipments: c._count.parcels,
            totalSpent: c.parcels.reduce((sum, p) => sum + p.totalAmount, 0),
        }));
    }

    /**
     * Get monthly statistics
     */
    async getMonthlyStats(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const parcels = await this.prisma.parcel.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                payments: true,
            },
        });

        const totalShipments = parcels.length;
        const totalRevenue = parcels.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPaid = parcels.reduce((sum, p) => {
            return sum + p.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
        }, 0);
        const averageShipmentValue = totalShipments > 0 ? totalRevenue / totalShipments : 0;

        const statusBreakdown = parcels.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            period: {
                year,
                month,
                startDate,
                endDate,
            },
            totalShipments,
            totalRevenue,
            totalPaid,
            outstandingPayments: totalRevenue - totalPaid,
            averageShipmentValue: Math.round(averageShipmentValue * 100) / 100,
            statusBreakdown,
        };
    }

    /**
     * Get customer growth report
     */
    async getCustomerGrowth(months: number = 6) {
        const growth: Array<{ month: string; newCustomers: number; date: Date }> = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const newCustomers = await this.prisma.customer.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            growth.push({
                month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                newCustomers,
                date: startDate,
            });
        }

        return growth;
    }

    /**
     * Export data for CSV/Excel
     */
    async exportParcels(filters?: {
        startDate?: Date;
        endDate?: Date;
        status?: ParcelStatus;
    }) {
        const where: any = {};

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = filters.startDate;
            if (filters.endDate) where.createdAt.lte = filters.endDate;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        const parcels = await this.prisma.parcel.findMany({
            where,
            include: {
                customer: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return parcels.map((p) => ({
            trackingNumber: p.trackingNumber,
            barcode: p.barcode,
            customerName: `${p.customer.firstName} ${p.customer.lastName}`,
            customerEmail: p.customer.email,
            customAddress: p.customer.customAddress,
            description: p.description,
            weight: p.weight,
            declaredValue: p.declaredValue,
            shippingFee: p.shippingFee,
            taxAmount: p.taxAmount,
            totalAmount: p.totalAmount,
            status: p.status,
            paymentStatus: p.paymentStatus,
            currentLocation: p.currentLocation,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
    }
}
