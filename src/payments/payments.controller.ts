import { Controller, Get, Post, Body, Param, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ReceiptService } from './receipt.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly receiptService: ReceiptService,
    ) { }

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }

    @Get()
    findAll(@Query('parcelId') parcelId?: string) {
        return this.paymentsService.findAll(parcelId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.paymentsService.findOne(id);
    }

    @Get(':id/receipt')
    async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
        const receiptBuffer = await this.receiptService.generateThermalReceipt(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=receipt-${id.substring(0, 8)}.pdf`,
            'Content-Length': receiptBuffer.length,
        });

        res.end(receiptBuffer);
    }
}
