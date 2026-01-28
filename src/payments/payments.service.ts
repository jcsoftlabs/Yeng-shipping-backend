import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ParcelStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async create(createPaymentDto: CreatePaymentDto) {
        // Get parcel details
        const parcel = await this.prisma.parcel.findUnique({
            where: { id: createPaymentDto.parcelId },
            include: {
                payments: true,
            },
        });

        if (!parcel) {
            throw new NotFoundException('Colis non trouvé');
        }

        // Calculate total paid so far
        const totalPaid = parcel.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = parcel.totalAmount - totalPaid;

        // Validate payment amount
        if (createPaymentDto.amount > remainingAmount) {
            throw new BadRequestException(
                `Le montant du paiement (${createPaymentDto.amount}) dépasse le montant restant (${remainingAmount})`,
            );
        }

        // Create payment record
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

        // Update parcel payment status
        const newTotalPaid = totalPaid + createPaymentDto.amount;
        let paymentStatus: PaymentStatus;
        let parcelStatus = parcel.status;

        if (newTotalPaid >= parcel.totalAmount) {
            paymentStatus = PaymentStatus.PAID;
            // If parcel is in Haiti and payment is complete, mark as ready for pickup
            if (parcel.status === ParcelStatus.ARRIVED_HAITI) {
                parcelStatus = ParcelStatus.READY_FOR_PICKUP;
            }
        } else if (newTotalPaid > 0) {
            paymentStatus = PaymentStatus.PARTIAL;
        } else {
            paymentStatus = PaymentStatus.PENDING;
        }

        // Update parcel
        await this.prisma.parcel.update({
            where: { id: createPaymentDto.parcelId },
            data: {
                paymentStatus,
                status: parcelStatus,
            },
        });

        // Update invoice status
        const invoice = await this.prisma.invoice.findFirst({
            where: { parcelId: createPaymentDto.parcelId },
            orderBy: { createdAt: 'desc' },
        });

        if (invoice) {
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    status: paymentStatus,
                    paidDate: paymentStatus === PaymentStatus.PAID ? new Date() : null,
                },
            });
        }

        // Create tracking event if status changed
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

    async findAll(parcelId?: string) {
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

    async findOne(id: string) {
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
            throw new NotFoundException('Paiement non trouvé');
        }

        return payment;
    }
}
