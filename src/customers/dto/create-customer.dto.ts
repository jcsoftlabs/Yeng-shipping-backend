import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateCustomerDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    firstName: string;

    @IsString()
    @MinLength(2)
    lastName: string;

    @IsString()
    phone: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    addressLine1?: string;

    @IsString()
    @IsOptional()
    addressLine2?: string;

    @IsString()
    @IsOptional()
    city?: string;
}
