import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ParcelStatus } from '@prisma/client';

export class UpdateParcelStatusDto {
    @IsEnum(ParcelStatus)
    status: ParcelStatus;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
