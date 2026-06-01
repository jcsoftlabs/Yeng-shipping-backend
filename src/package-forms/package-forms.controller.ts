import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PackageFormsService } from './package-forms.service';
import { CreatePackageFormDto } from './dto/create-package-form.dto';

@Controller('package-forms')
export class PackageFormsController {
    constructor(private readonly packageFormsService: PackageFormsService) { }

    @Post()
    create(@Body() createPackageFormDto: CreatePackageFormDto) {
        return this.packageFormsService.create(createPackageFormDto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.packageFormsService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.packageFormsService.findOne(id);
    }
}
