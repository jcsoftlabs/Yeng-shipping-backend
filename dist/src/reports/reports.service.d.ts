import { PrismaService } from '../prisma/prisma.service';
import { ParcelStatus } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalShipments: {
            value: number;
            growth: number;
        };
        revenue: {
            value: number;
            growth: number;
        };
        activeDeliveries: {
            value: number;
            readyForPickup: number;
        };
        pendingTasks: {
            value: number;
            urgentIssues: number;
        };
    }>;
    getShippingVolume(days?: number): Promise<{
        day: string;
        count: number;
        date: string;
    }[]>;
    getRevenueReport(startDate?: Date, endDate?: Date): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        byMethod: Record<string, number>;
        payments: {
            id: string;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            date: Date;
            trackingNumber: string;
            customerName: string;
        }[];
    }>;
    getShipmentStatusBreakdown(): Promise<{
        status: import("@prisma/client").$Enums.ParcelStatus;
        count: number;
    }[]>;
    getTopCustomers(limit?: number): Promise<{
        id: string;
        name: string;
        email: string;
        customAddress: string;
        totalShipments: number;
        totalSpent: number;
    }[]>;
    getMonthlyStats(year: number, month: number): Promise<{
        period: {
            year: number;
            month: number;
            startDate: Date;
            endDate: Date;
        };
        totalShipments: number;
        totalRevenue: number;
        totalPaid: number;
        outstandingPayments: number;
        averageShipmentValue: number;
        statusBreakdown: Record<string, number>;
    }>;
    getCustomerGrowth(months?: number): Promise<{
        month: string;
        newCustomers: number;
        date: Date;
    }[]>;
    exportParcels(filters?: {
        startDate?: Date;
        endDate?: Date;
        status?: ParcelStatus;
    }): Promise<{
        trackingNumber: string;
        barcode: string | null;
        customerName: string;
        customerEmail: string;
        customAddress: string;
        description: string;
        weight: number;
        declaredValue: number;
        shippingFee: number;
        taxAmount: number;
        totalAmount: number;
        status: import("@prisma/client").$Enums.ParcelStatus;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        currentLocation: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
