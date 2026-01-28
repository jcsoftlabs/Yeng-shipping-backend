import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ParcelStatus } from '@prisma/client';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get('shipping-volume')
    getShippingVolume(@Query('days') days?: string) {
        const daysNum = days ? parseInt(days, 10) : 7;
        return this.reportsService.getShippingVolume(daysNum);
    }

    @Get('revenue')
    getRevenueReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.reportsService.getRevenueReport(start, end);
    }

    @Get('status-breakdown')
    getShipmentStatusBreakdown() {
        return this.reportsService.getShipmentStatusBreakdown();
    }

    @Get('top-customers')
    getTopCustomers(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.reportsService.getTopCustomers(limitNum);
    }

    @Get('monthly')
    getMonthlyStats(
        @Query('year') year: string,
        @Query('month') month: string,
    ) {
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        return this.reportsService.getMonthlyStats(yearNum, monthNum);
    }

    @Get('customer-growth')
    getCustomerGrowth(@Query('months') months?: string) {
        const monthsNum = months ? parseInt(months, 10) : 6;
        return this.reportsService.getCustomerGrowth(monthsNum);
    }

    @Get('export/parcels')
    exportParcels(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: ParcelStatus,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.reportsService.exportParcels({
            startDate: start,
            endDate: end,
            status,
        });
    }
}
