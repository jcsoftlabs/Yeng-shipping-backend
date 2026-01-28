import { Controller, Get, Post, Param, Query, Res, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    findAll(
        @Query('customerId') customerId?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.invoicesService.findAll({ customerId, status, search });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Get(':id/pdf')
    async downloadPDF(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.invoicesService.generatePDF(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    @Post(':id/send-email')
    sendEmail(@Param('id') id: string) {
        return this.invoicesService.sendEmail(id);
    }
}
