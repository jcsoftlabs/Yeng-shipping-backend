import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { ParcelStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class ParcelsService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    /**
     * Generate tracking number with YNG prefix
     * Format: YNG-XXXXXXXX (8 random digits)
     */
    private async generateTrackingNumber(): Promise<string> {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        const trackingNumber = `YNG-${randomDigits}`;

        // Ensure uniqueness
        const existing = await this.prisma.parcel.findUnique({
            where: { trackingNumber },
        });

        if (existing) {
            return this.generateTrackingNumber();
        }

        return trackingNumber;
    }

    /**
     * Calculate shipping fee based on weight and declared value
     * Formula: (weight in lbs * $3) + (declared value * 2%)
     */
    private calculateShippingFee(weight: number, declaredValue: number): number {
        const weightFee = weight * 3; // $3 per pound
        const valueFee = declaredValue * 0.02; // 2% of declared value
        const shippingFee = weightFee + valueFee;
        return Math.round(shippingFee * 100) / 100; // Round to 2 decimals
    }

    /**
     * Calculate tax (10% of shipping fee)
     */
    private calculateTax(shippingFee: number): number {
        return Math.round(shippingFee * 0.1 * 100) / 100;
    }

    async create(createParcelDto: CreateParcelDto) {
        // Check if customer exists
        const customer = await this.prisma.customer.findUnique({
            where: { id: createParcelDto.customerId },
        });

        if (!customer) {
            throw new NotFoundException('Client non trouvé');
        }

        // Check if barcode already exists
        if (createParcelDto.barcode) {
            const existingParcel = await this.prisma.parcel.findUnique({
                where: { barcode: createParcelDto.barcode },
            });

            if (existingParcel) {
                throw new ConflictException('Un colis avec ce code-barre existe déjà');
            }
        }

        // Generate tracking number
        const trackingNumber = await this.generateTrackingNumber();

        // Calculate fees - use manual pricing if provided, otherwise calculate automatically
        let shippingFee: number;
        let discount: number;
        let taxAmount: number;
        let totalAmount: number;

        if (createParcelDto.shippingFee !== undefined) {
            // Manual pricing mode
            shippingFee = createParcelDto.shippingFee;
            discount = createParcelDto.discount || 0;
            taxAmount = createParcelDto.taxAmount || 0;
            totalAmount = shippingFee - discount + taxAmount;
        } else {
            // Automatic calculation mode
            // Note: Weight is now in lbs (pounds)
            shippingFee = this.calculateShippingFee(
                createParcelDto.weight,
                createParcelDto.declaredValue,
            );
            discount = 0;
            taxAmount = this.calculateTax(shippingFee);
            totalAmount = shippingFee + taxAmount;
        }

        // Create parcel
        const parcel = await this.prisma.parcel.create({
            data: {
                trackingNumber,
                barcode: createParcelDto.barcode,
                customerId: createParcelDto.customerId,
                senderName: createParcelDto.senderName,
                senderAddress: createParcelDto.senderAddress,
                senderCity: createParcelDto.senderCity,
                senderState: createParcelDto.senderState,
                senderZipCode: createParcelDto.senderZipCode,
                senderCountry: 'USA',
                description: createParcelDto.description,
                weight: createParcelDto.weight,
                length: createParcelDto.length,
                width: createParcelDto.width,
                height: createParcelDto.height,
                declaredValue: createParcelDto.declaredValue,
                shippingFee,
                discount,
                taxAmount,
                totalAmount,
                currentLocation: `${createParcelDto.senderCity}, ${createParcelDto.senderState}`,
                notes: createParcelDto.notes,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        customAddress: true,
                    },
                },
            },
        });

        // Create initial tracking event
        await this.prisma.trackingEvent.create({
            data: {
                parcelId: parcel.id,
                status: ParcelStatus.PENDING,
                location: parcel.currentLocation || 'USA',
                description: 'Colis enregistré dans le système',
            },
        });

        // Auto-generate invoice
        await this.generateInvoice(parcel.id);

        // 🆕 Send email notification
        try {
            const parcelWithCustomer = await this.prisma.parcel.findUnique({
                where: { id: parcel.id },
                include: { customer: true },
            });
            if (parcelWithCustomer) {
                await this.emailService.sendParcelCreatedEmail(parcelWithCustomer as any);
            }
        } catch (error) {
            console.error('Failed to send parcel created email:', error);
            // Don't throw - email failure shouldn't block parcel creation
        }

        return parcel;
    }

    async findAll(filters?: {
        status?: ParcelStatus;
        customerId?: string;
        search?: string;
    }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.customerId) {
            where.customerId = filters.customerId;
        }

        if (filters?.search) {
            where.OR = [
                { trackingNumber: { contains: filters.search, mode: 'insensitive' } },
                { barcode: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { customer: { customAddress: { contains: filters.search, mode: 'insensitive' } } },
                { customer: { firstName: { contains: filters.search, mode: 'insensitive' } } },
                { customer: { lastName: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }

        const parcels = await this.prisma.parcel.findMany({
            where,
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        customAddress: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return parcels;
    }

    async findOne(id: string) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { id },
            include: {
                customer: true,
                trackingEvents: {
                    orderBy: { timestamp: 'desc' },
                },
                invoices: true,
                payments: true,
            },
        });

        if (!parcel) {
            throw new NotFoundException('Colis non trouvé');
        }

        return parcel;
    }

    async findByTracking(trackingNumber: string) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { trackingNumber },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        customAddress: true,
                    },
                },
                trackingEvents: {
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!parcel) {
            throw new NotFoundException('Numéro de suivi invalide');
        }

        return parcel;
    }

    async findByBarcode(barcode: string) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { barcode },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        customAddress: true,
                    },
                },
            },
        });

        if (!parcel) {
            throw new NotFoundException('Code-barre invalide');
        }

        return parcel;
    }

    async updateStatus(id: string, updateStatusDto: UpdateParcelStatusDto) {
        const parcel = await this.findOne(id);
        const oldStatus = parcel.status;

        // Update parcel status
        const updatedParcel = await this.prisma.parcel.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
                currentLocation: updateStatusDto.location || parcel.currentLocation || 'Unknown',
            },
            include: {
                customer: true,
            },
        });

        // Create tracking event
        await this.prisma.trackingEvent.create({
            data: {
                parcelId: id,
                status: updateStatusDto.status,
                location: updateStatusDto.location || this.getDefaultLocationForStatus(updateStatusDto.status, parcel.currentLocation || 'Unknown'),
                description: updateStatusDto.description || this.getStatusDescription(updateStatusDto.status),
            },
        });

        // Update the parcel location too if it changed
        const newLocation = updateStatusDto.location || this.getDefaultLocationForStatus(updateStatusDto.status, parcel.currentLocation || 'Unknown');
        if (newLocation !== parcel.currentLocation) {
            await this.prisma.parcel.update({
                where: { id },
                data: { currentLocation: newLocation }
            });
        }

        // 🆕 Send email notification if status changed
        if (oldStatus !== updateStatusDto.status) {
            try {
                await this.emailService.sendParcelStatusUpdatedEmail(
                    updatedParcel as any,
                    oldStatus,
                    updateStatusDto.status,
                );
            } catch (error) {
                console.error('Failed to send status update email:', error);
                // Don't throw - email failure shouldn't block status update
            }
        }

        return updatedParcel;
    }

    private getDefaultLocationForStatus(status: ParcelStatus, currentLocation: string = 'Unknown'): string {
        switch (status) {
            case ParcelStatus.IN_TRANSIT_HAITI:
                return 'En route vers Haïti';
            case ParcelStatus.ARRIVED_HAITI:
                return 'Port-au-Prince, Haïti';
            case ParcelStatus.DEPARTED_USA:
                return 'Miami, FL (Départ)';
            case ParcelStatus.PICKED_UP:
                return 'Livré au client';
            default:
                return currentLocation;
        }
    }

    private getStatusDescription(status: ParcelStatus): string {
        const descriptions = {
            [ParcelStatus.PENDING]: 'En attente d\'expédition',
            [ParcelStatus.IN_TRANSIT_USA]: 'En transit aux États-Unis',
            [ParcelStatus.DEPARTED_USA]: 'A quitté les États-Unis',
            [ParcelStatus.IN_TRANSIT_HAITI]: 'En transit vers Haïti',
            [ParcelStatus.ARRIVED_HAITI]: 'Arrivé en Haïti',
            [ParcelStatus.READY_FOR_PICKUP]: 'Prêt pour récupération',
            [ParcelStatus.PICKED_UP]: 'Récupéré par le client',
            [ParcelStatus.CANCELLED]: 'Annulé',
        };

        return descriptions[status] || 'Statut mis à jour';
    }

    private async generateInvoice(parcelId: string) {
        const parcel = await this.findOne(parcelId);

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await this.prisma.invoice.create({
            data: {
                invoiceNumber,
                parcelId,
                subtotal: parcel.shippingFee,
                taxAmount: parcel.taxAmount,
                totalAmount: parcel.totalAmount,
            },
        });
    }
}
