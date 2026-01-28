import { InvoicesService } from './invoices.service';
import type { Response } from 'express';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(customerId?: string, status?: string, search?: string): Promise<({
        parcel: {
            customer: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                customAddress: string;
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
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        taxAmount: number;
        totalAmount: number;
        notes: string | null;
        parcelId: string;
        invoiceNumber: string;
        subtotal: number;
        dueDate: Date | null;
        paidDate: Date | null;
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
            payments: {
                id: string;
                createdAt: Date;
                notes: string | null;
                parcelId: string;
                amount: number;
                method: import("@prisma/client").$Enums.PaymentMethod;
                reference: string | null;
                receivedBy: string | null;
            }[];
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
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        taxAmount: number;
        totalAmount: number;
        notes: string | null;
        parcelId: string;
        invoiceNumber: string;
        subtotal: number;
        dueDate: Date | null;
        paidDate: Date | null;
    }>;
    downloadPDF(id: string, res: Response): Promise<void>;
    sendEmail(id: string): Promise<{
        message: string;
    }>;
}
