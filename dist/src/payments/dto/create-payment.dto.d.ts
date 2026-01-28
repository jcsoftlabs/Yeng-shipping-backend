import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    parcelId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    receivedBy?: string;
    notes?: string;
}
