import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPaymentDto: CreatePaymentDto): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        parcelId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string | null;
    }>;
    findAll(parcelId?: string): Promise<({
        parcel: {
            customer: {
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            length: number | null;
            trackingNumber: string;
            barcode: string | null;
            customerId: string;
            senderName: string;
            senderAddress: string;
            senderCity: string;
            senderState: string;
            senderZipCode: string;
            senderCountry: string;
            description: string;
            weight: number;
            width: number | null;
            height: number | null;
            declaredValue: number;
            status: import("@prisma/client").$Enums.ParcelStatus;
            currentLocation: string | null;
            estimatedArrival: Date | null;
            shippingFee: number;
            discount: number;
            taxAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        parcelId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string | null;
    })[]>;
    findOne(id: string): Promise<{
        parcel: {
            customer: {
                id: string;
                email: string;
                password: string | null;
                firstName: string;
                lastName: string;
                phone: string;
                customAddress: string;
                fullUSAAddress: string | null;
                addressLine1: string | null;
                addressLine2: string | null;
                city: string | null;
                country: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            length: number | null;
            trackingNumber: string;
            barcode: string | null;
            customerId: string;
            senderName: string;
            senderAddress: string;
            senderCity: string;
            senderState: string;
            senderZipCode: string;
            senderCountry: string;
            description: string;
            weight: number;
            width: number | null;
            height: number | null;
            declaredValue: number;
            status: import("@prisma/client").$Enums.ParcelStatus;
            currentLocation: string | null;
            estimatedArrival: Date | null;
            shippingFee: number;
            discount: number;
            taxAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        parcelId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string | null;
    }>;
}
