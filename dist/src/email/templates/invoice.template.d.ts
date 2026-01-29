export declare function getInvoiceEmailTemplate(data: {
    customerName: string;
    invoiceNumber: string;
    trackingNumber: string;
    invoiceDate: string;
    totalAmount: number;
    parcelDescription: string;
}): {
    subject: string;
    html: string;
};
