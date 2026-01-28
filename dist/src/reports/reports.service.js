"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const totalShipments = await this.prisma.parcel.count();
        const lastMonthShipments = await this.prisma.parcel.count({
            where: { createdAt: { gte: lastMonth } },
        });
        const previousMonthShipments = totalShipments - lastMonthShipments;
        const shipmentsGrowth = previousMonthShipments > 0
            ? ((lastMonthShipments - previousMonthShipments) / previousMonthShipments) * 100
            : 0;
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
        const activeDeliveries = await this.prisma.parcel.count({
            where: {
                status: {
                    in: [
                        client_1.ParcelStatus.IN_TRANSIT_USA,
                        client_1.ParcelStatus.DEPARTED_USA,
                        client_1.ParcelStatus.IN_TRANSIT_HAITI,
                    ],
                },
            },
        });
        const readyForPickup = await this.prisma.parcel.count({
            where: { status: client_1.ParcelStatus.READY_FOR_PICKUP },
        });
        const pendingTasks = await this.prisma.parcel.count({
            where: {
                OR: [
                    { status: client_1.ParcelStatus.PENDING },
                    { status: client_1.ParcelStatus.ARRIVED_HAITI, paymentStatus: client_1.PaymentStatus.PENDING },
                ],
            },
        });
        const urgentIssues = await this.prisma.parcel.count({
            where: { status: client_1.ParcelStatus.CANCELLED },
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
    async getShippingVolume(days = 7) {
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
        const volumeByDay = {};
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
    async getRevenueReport(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
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
        }, {});
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
    async getTopCustomers(limit = 10) {
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
    async getMonthlyStats(year, month) {
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
        }, {});
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
    async getCustomerGrowth(months = 6) {
        const growth = [];
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
    async exportParcels(filters) {
        const where = {};
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = filters.startDate;
            if (filters.endDate)
                where.createdAt.lte = filters.endDate;
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map