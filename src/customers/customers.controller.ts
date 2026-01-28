import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.customersService.findAll(search);
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
