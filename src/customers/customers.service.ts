import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
    // Yeng Shipping warehouse address in Miami
    private readonly WAREHOUSE_ADDRESS = {
        street: '7829 NW 72nd Ave',
        city: 'Miami',
        state: 'FL',
        zipCode: '33166',
    };

    constructor(private prisma: PrismaService) { }

    /**
     * Generate custom shipping address
     * Format: YENGSHIPPING + FirstLetterLastName + FirstName + / + UniqueCode
     * Example: YENGSHIPPING PJean/4582
     */
    private async generateCustomAddress(firstName: string, lastName: string): Promise<string> {
        const firstLetterLastName = lastName.charAt(0).toUpperCase();
        const uniqueCode = Math.floor(1000 + Math.random() * 9000); // 4-digit unique code

        let customAddress = `YENGSHIPPING ${firstLetterLastName}${firstName}/${uniqueCode}`;

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

    /**
     * Generate full USA delivery address
     * Combines custom address with warehouse location
     */
    private generateFullUSAAddress(customAddress: string): string {
        return `${customAddress}\n${this.WAREHOUSE_ADDRESS.street}\n${this.WAREHOUSE_ADDRESS.city}, ${this.WAREHOUSE_ADDRESS.state} ${this.WAREHOUSE_ADDRESS.zipCode}`;
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

        // Generate full USA delivery address
        const fullUSAAddress = this.generateFullUSAAddress(customAddress);

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
                fullUSAAddress,
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
                fullUSAAddress: true,
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
                fullUSAAddress: true,
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

    async getUSAAddress(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                customAddress: true,
                fullUSAAddress: true,
            },
        });

        if (!customer) {
            throw new NotFoundException('Client non trouvé');
        }

        return {
            customerId: customer.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customAddress: customer.customAddress,
            fullAddress: customer.fullUSAAddress,
            formattedAddress: customer.fullUSAAddress?.split('\n') || [],
        };
    }

    async searchByCode(searchTerm: string) {
        // Search by unique code (e.g., "4582") or partial custom address
        const customers = await this.prisma.customer.findMany({
            where: {
                OR: [
                    { customAddress: { contains: searchTerm, mode: 'insensitive' as const } },
                    { customAddress: { endsWith: `/${searchTerm}` } }, // Search by code only
                ],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                customAddress: true,
                fullUSAAddress: true,
                addressLine1: true,
                city: true,
                country: true,
            },
            take: 10, // Limit results
        });

        return customers;
    }
}
