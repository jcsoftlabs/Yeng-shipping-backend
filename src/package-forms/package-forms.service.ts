import { Injectable, NotFoundException } from '@nestjs/common';
import { PackageFormSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageFormDto } from './dto/create-package-form.dto';

@Injectable()
export class PackageFormsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createPackageFormDto: CreatePackageFormDto) {
        const normalizedEmail = createPackageFormDto.email.trim().toLowerCase();
        const customerId = createPackageFormDto.customerId || await this.findCustomerIdByEmail(normalizedEmail);
        const trackingNumbers = createPackageFormDto.trackingNumbers
            .map((trackingNumber) => trackingNumber.trim())
            .filter(Boolean);

        const packageForm = await this.prisma.packageForm.create({
            data: {
                customerId,
                fullName: createPackageFormDto.fullName.trim(),
                email: normalizedEmail,
                address: createPackageFormDto.address.trim(),
                city: createPackageFormDto.city.trim(),
                country: createPackageFormDto.country.trim(),
                packageCount: createPackageFormDto.packageCount,
                trackingNumbers,
                packageDescription: createPackageFormDto.packageDescription?.trim() || null,
                notes: createPackageFormDto.notes?.trim() || null,
                signatureDataUrl: createPackageFormDto.signatureDataUrl,
                source: createPackageFormDto.source || (customerId ? PackageFormSource.CUSTOMER_PORTAL : PackageFormSource.PUBLIC),
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        customAddress: true,
                    },
                },
            },
        });

        return packageForm;
    }

    async findAll(search?: string) {
        const where = search
            ? {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { city: { contains: search, mode: 'insensitive' as const } },
                    { customer: { customAddress: { contains: search, mode: 'insensitive' as const } } },
                ],
            }
            : {};

        return this.prisma.packageForm.findMany({
            where,
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        customAddress: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const packageForm = await this.prisma.packageForm.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        customAddress: true,
                        fullUSAAddress: true,
                    },
                },
            },
        });

        if (!packageForm) {
            throw new NotFoundException('Bon de package introuvable');
        }

        return packageForm;
    }

    private async findCustomerIdByEmail(email: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { email },
            select: { id: true },
        });

        return customer?.id;
    }
}
