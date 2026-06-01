import { Module } from '@nestjs/common';
import { PackageFormsController } from './package-forms.controller';
import { PackageFormsService } from './package-forms.service';

@Module({
    controllers: [PackageFormsController],
    providers: [PackageFormsService],
    exports: [PackageFormsService],
})
export class PackageFormsModule { }
