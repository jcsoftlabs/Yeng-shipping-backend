"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ParcelsService = class ParcelsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateTrackingNumber() {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        const trackingNumber = `YNG-${randomDigits}`;
        const existing = await this.prisma.parcel.findUnique({
            where: { trackingNumber },
        });
        if (existing) {
            return this.generateTrackingNumber();
        }
        return trackingNumber;
    }
    calculateShippingFee(weight, declaredValue) {
        const baseRate = 5;
        const weightFee = weight * baseRate;
        const insuranceFee = declaredValue * 0.02;
        return Math.round((weightFee + insuranceFee) * 100) / 100;
    }
    calculateTax(shippingFee) {
        return Math.round(shippingFee * 0.1 * 100) / 100;
    }
    async create(createParcelDto) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: createParcelDto.customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Client non trouvé');
        }
        if (createParcelDto.barcode) {
            const existingParcel = await this.prisma.parcel.findUnique({
                where: { barcode: createParcelDto.barcode },
            });
            if (existingParcel) {
                throw new common_1.ConflictException('Un colis avec ce code-barre existe déjà');
            }
        }
        const trackingNumber = await this.generateTrackingNumber();
        let shippingFee;
        let discount;
        let taxAmount;
        let totalAmount;
        if (createParcelDto.shippingFee !== undefined) {
            shippingFee = createParcelDto.shippingFee;
            discount = createParcelDto.discount || 0;
            taxAmount = createParcelDto.taxAmount || 0;
            totalAmount = shippingFee - discount + taxAmount;
        }
        else {
            shippingFee = this.calculateShippingFee(createParcelDto.weight, createParcelDto.declaredValue);
            discount = 0;
            taxAmount = this.calculateTax(shippingFee);
            totalAmount = shippingFee + taxAmount;
        }
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
        await this.prisma.trackingEvent.create({
            data: {
                parcelId: parcel.id,
                status: client_1.ParcelStatus.PENDING,
                location: parcel.currentLocation || 'USA',
                description: 'Colis enregistré dans le système',
            },
        });
        await this.generateInvoice(parcel.id);
        return parcel;
    }
    async findAll(filters) {
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Colis non trouvé');
        }
        return parcel;
    }
    async findByTracking(trackingNumber) {
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
            throw new common_1.NotFoundException('Numéro de suivi invalide');
        }
        return parcel;
    }
    async findByBarcode(barcode) {
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
            throw new common_1.NotFoundException('Code-barre invalide');
        }
        return parcel;
    }
    async updateStatus(id, updateStatusDto) {
        const parcel = await this.findOne(id);
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
        await this.prisma.trackingEvent.create({
            data: {
                parcelId: id,
                status: updateStatusDto.status,
                location: updateStatusDto.location || parcel.currentLocation || 'Unknown',
                description: updateStatusDto.description || this.getStatusDescription(updateStatusDto.status),
            },
        });
        return updatedParcel;
    }
    getStatusDescription(status) {
        const descriptions = {
            [client_1.ParcelStatus.PENDING]: 'En attente d\'expédition',
            [client_1.ParcelStatus.IN_TRANSIT_USA]: 'En transit aux États-Unis',
            [client_1.ParcelStatus.DEPARTED_USA]: 'A quitté les États-Unis',
            [client_1.ParcelStatus.IN_TRANSIT_HAITI]: 'En transit vers Haïti',
            [client_1.ParcelStatus.ARRIVED_HAITI]: 'Arrivé en Haïti',
            [client_1.ParcelStatus.READY_FOR_PICKUP]: 'Prêt pour récupération',
            [client_1.ParcelStatus.PICKED_UP]: 'Récupéré par le client',
            [client_1.ParcelStatus.CANCELLED]: 'Annulé',
        };
        return descriptions[status] || 'Statut mis à jour';
    }
    async generateInvoice(parcelId) {
        const parcel = await this.findOne(parcelId);
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
};
exports.ParcelsService = ParcelsService;
exports.ParcelsService = ParcelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParcelsService);
//# sourceMappingURL=parcels.service.js.map