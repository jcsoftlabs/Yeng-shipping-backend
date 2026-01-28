import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { ParcelStatus } from '@prisma/client';

@Controller('parcels')
export class ParcelsController {
    constructor(private readonly parcelsService: ParcelsService) { }

    @Post()
    create(@Body() createParcelDto: CreateParcelDto) {
        return this.parcelsService.create(createParcelDto);
    }

    @Get()
    findAll(
        @Query('status') status?: ParcelStatus,
        @Query('customerId') customerId?: string,
        @Query('search') search?: string,
    ) {
        return this.parcelsService.findAll({ status, customerId, search });
    }

    @Get('tracking/:trackingNumber')
    findByTracking(@Param('trackingNumber') trackingNumber: string) {
        return this.parcelsService.findByTracking(trackingNumber);
    }

    @Get('barcode/:barcode')
    findByBarcode(@Param('barcode') barcode: string) {
        return this.parcelsService.findByBarcode(barcode);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.parcelsService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateParcelStatusDto,
    ) {
        return this.parcelsService.updateStatus(id, updateStatusDto);
    }
}
