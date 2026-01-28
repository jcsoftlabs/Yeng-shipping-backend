import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate custom shipping address
     * Format: YENGSHIPPING + FirstLetter + FirstName + RandomNumber
     * Example: YENGSHIPPINGJ-Pierre-4582
     */
    private async generateCustomAddress(firstName: string, lastName: string): Promise<string> {
        const firstLetter = lastName.charAt(0).toUpperCase();
        const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number

        let customAddress = `YENGSHIPPING${firstLetter}-${firstName}-${randomNumber}`;

        // Ensure uniqueness
        const existing = await this.prisma.customer.findUnique({
            where: { customAddress },
        });

        if (existing) {
            // If collision (rare), try again recursively
            return this.generateCustomAddress(firstName, lastName);
        }

        return customAddress;
    }

    async create(createCustomerDto: CreateCustomerDto) {
        // Check if email already exists
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { email: createCustomerDto.email },
        });

        if (existingCustomer) {
            throw new ConflictException('Un client avec cet email existe déjà');
        }

        // Generate custom address
        const customAddress = await this.generateCustomAddress(
            createCustomerDto.firstName,
            createCustomerDto.lastName,
        );

        // Hash password if provided
        let hashedPassword: string | undefined;
        if (createCustomerDto.password) {
            hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);
        }

        const customer = await this.prisma.customer.create({
            data: {
                email: createCustomerDto.email,
                firstName: createCustomerDto.firstName,
                lastName: createCustomerDto.lastName,
                phone: createCustomerDto.phone,
                customAddress,
                password: hashedPassword,
                addressLine1: createCustomerDto.addressLine1,
                addressLine2: createCustomerDto.addressLine2,
                city: createCustomerDto.city,
            },
        });

        // Don't return password
        const { password, ...result } = customer;
        return result;
    }

    async findAll(search?: string) {
        const where = search
            ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { customAddress: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const customers = await this.prisma.customer.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { parcels: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return customers;
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                parcels: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!customer) {
            throw new NotFoundException('Client non trouvé');
        }

        return customer;
    }

    async findByEmail(email: string) {
        return this.prisma.customer.findUnique({
            where: { email },
        });
    }

    async findByCustomAddress(customAddress: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { customAddress },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!customer) {
            throw new NotFoundException('Client non trouvé');
        }

        return customer;
    }
}
