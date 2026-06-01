import { PackageFormSource } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePackageFormDto {
    @IsString()
    @MinLength(5)
    fullName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    address: string;

    @IsString()
    @MinLength(2)
    city: string;

    @IsString()
    @MinLength(2)
    country: string;

    @IsInt()
    @Min(1)
    packageCount: number;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    trackingNumbers: string[];

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    packageDescription?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;

    @IsString()
    @MinLength(20)
    signatureDataUrl: string;

    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsEnum(PackageFormSource)
    source?: PackageFormSource;
}
