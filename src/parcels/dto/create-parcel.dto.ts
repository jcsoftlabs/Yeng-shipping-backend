import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateParcelDto {
    @IsUUID()
    customerId: string;

    @IsString()
    @IsOptional()
    barcode?: string;

    // Sender information
    @IsString()
    senderName: string;

    @IsString()
    senderAddress: string;

    @IsString()
    senderCity: string;

    @IsString()
    senderState: string;

    @IsString()
    senderZipCode: string;

    // Package details
    @IsString()
    description: string;

    @IsNumber()
    @Min(0.1)
    weight: number; // in lbs (pounds)

    @IsNumber()
    @IsOptional()
    @Min(0)
    length?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    width?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    height?: number;

    @IsNumber()
    @Min(0)
    declaredValue: number;

    // Manual pricing (optional - if not provided, will be calculated automatically)
    @IsNumber()
    @IsOptional()
    @Min(0)
    shippingFee?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    discount?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    taxAmount?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
