interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    customAddress?: string;
    fullUSAAddress?: string;
}
interface Parcel {
    id: string;
    trackingNumber: string;
    description: string;
    weight: number;
    declaredValue: number;
    currentLocation?: string;
    customer: Customer;
}
export declare class EmailService {
    private transporter;
    private readonly logger;
    private readonly frontendUrl;
    constructor();
    private verifyConnection;
    sendWelcomeEmail(customer: Customer): Promise<void>;
    sendParcelCreatedEmail(parcel: Parcel): Promise<void>;
    sendParcelStatusUpdatedEmail(parcel: Parcel, oldStatus: string, newStatus: string): Promise<void>;
    sendPasswordResetEmail(customer: Customer, resetToken: string, expiresInMinutes?: number): Promise<void>;
    sendPaymentConfirmationEmail(data: {
        customer: Customer;
        trackingNumber: string;
        paymentAmount: number;
        paymentMethod: string;
        paymentDate: string;
        receiptNumber: string;
        parcelDescription: string;
    }): Promise<void>;
    sendInvoiceEmail(data: {
        customer: Customer;
        invoiceNumber: string;
        trackingNumber: string;
        invoiceDate: string;
        totalAmount: number;
        parcelDescription: string;
        pdfBuffer: Buffer;
    }): Promise<void>;
    sendTestEmail(to: string): Promise<void>;
}
export {};
