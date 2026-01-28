import { IsUUID, IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
    @IsUUID()
    parcelId: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsString()
    @IsOptional()
    reference?: string;

    @IsString()
    @IsOptional()
    receivedBy?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
