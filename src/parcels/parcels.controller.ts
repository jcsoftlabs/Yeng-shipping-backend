import { Controller, Get, Post, Body, Param, Patch, Query, Req, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { ParcelsService } from './parcels.service';
import { AuthService } from '../auth/auth.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { ParcelStatus } from '@prisma/client';

@Controller('parcels')
export class ParcelsController {
    constructor(
        private readonly parcelsService: ParcelsService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) { }

    @Post()
    create(@Body() createParcelDto: CreateParcelDto) {
        return this.parcelsService.create(createParcelDto);
    }

    @Get()
    async findAll(
        @Query('status') status?: ParcelStatus,
        @Query('customerId') customerId?: string,
        @Query('search') search?: string,
        @Req() req?,
    ) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('Authentification requise');
        }

        let finalCustomerId = customerId;

        try {
            const token = authHeader.split(' ')[1];
            const payload = await this.authService.validateToken(token);

            // Security: If user is a CUSTOMER, force filtering by their own ID
            if (payload.role === 'CUSTOMER') {
                finalCustomerId = payload.sub;
            }
        } catch (error) {
            throw new UnauthorizedException('Session invalide');
        }

        return this.parcelsService.findAll({ status, customerId: finalCustomerId, search });
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
