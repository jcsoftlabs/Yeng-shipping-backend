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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPaymentDto) {
        const parcel = await this.prisma.parcel.findUnique({
            where: { id: createPaymentDto.parcelId },
            include: {
                payments: true,
            },
        });
        if (!parcel) {
            throw new common_1.NotFoundException('Colis non trouvé');
        }
        const totalPaid = parcel.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = parcel.totalAmount - totalPaid;
        if (createPaymentDto.amount > remainingAmount) {
            throw new common_1.BadRequestException(`Le montant du paiement (${createPaymentDto.amount}) dépasse le montant restant (${remainingAmount})`);
        }
        const payment = await this.prisma.payment.create({
            data: {
                parcelId: createPaymentDto.parcelId,
                amount: createPaymentDto.amount,
                method: createPaymentDto.method,
                reference: createPaymentDto.reference,
                receivedBy: createPaymentDto.receivedBy,
                notes: createPaymentDto.notes,
            },
        });
        const newTotalPaid = totalPaid + createPaymentDto.amount;
        let paymentStatus;
        let parcelStatus = parcel.status;
        if (newTotalPaid >= parcel.totalAmount) {
            paymentStatus = client_1.PaymentStatus.PAID;
            if (parcel.status === client_1.ParcelStatus.ARRIVED_HAITI) {
                parcelStatus = client_1.ParcelStatus.READY_FOR_PICKUP;
            }
        }
        else if (newTotalPaid > 0) {
            paymentStatus = client_1.PaymentStatus.PARTIAL;
        }
        else {
            paymentStatus = client_1.PaymentStatus.PENDING;
        }
        await this.prisma.parcel.update({
            where: { id: createPaymentDto.parcelId },
            data: {
                paymentStatus,
                status: parcelStatus,
            },
        });
        const invoice = await this.prisma.invoice.findFirst({
            where: { parcelId: createPaymentDto.parcelId },
            orderBy: { createdAt: 'desc' },
        });
        if (invoice) {
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    status: paymentStatus,
                    paidDate: paymentStatus === client_1.PaymentStatus.PAID ? new Date() : null,
                },
            });
        }
        if (parcelStatus !== parcel.status) {
            await this.prisma.trackingEvent.create({
                data: {
                    parcelId: createPaymentDto.parcelId,
                    status: parcelStatus,
                    location: parcel.currentLocation || 'Haiti',
                    description: 'Paiement reçu - Prêt pour récupération',
                },
            });
        }
        return payment;
    }
    async findAll(parcelId) {
        const where = parcelId ? { parcelId } : {};
        const payments = await this.prisma.payment.findMany({
            where,
            include: {
                parcel: {
                    include: {
                        customer: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return payments;
    }
    async findOne(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                parcel: {
                    include: {
                        customer: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Paiement non trouvé');
        }
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map