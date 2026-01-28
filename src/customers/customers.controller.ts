import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuthService } from '../auth/auth.service';

@Controller('customers')
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) { }

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.customersService.findAll(search);
    }

    @Get('me')
    async getProfile(@Req() req) {
        // Extract token from header manually since we don't have a configured global guard
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('Token manquant');
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload = await this.authService.validateToken(token);
            return this.customersService.findOne(payload.sub);
        } catch (error) {
            throw new UnauthorizedException('Token invalide');
        }
    }

    @Get('search/by-code')
    searchByCode(@Query('code') code: string) {
        return this.customersService.searchByCode(code);
    }

    @Get('address/:customAddress')
    findByCustomAddress(@Param('customAddress') customAddress: string) {
        return this.customersService.findByCustomAddress(customAddress);
    }

    @Get(':id/usa-address')
    getUSAAddress(@Param('id') id: string) {
        return this.customersService.getUSAAddress(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }
}
