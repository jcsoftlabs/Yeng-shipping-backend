export declare function getPaymentConfirmationEmailTemplate(data: {
    customerName: string;
    trackingNumber: string;
    paymentAmount: number;
    paymentMethod: string;
    paymentDate: string;
    receiptNumber: string;
    parcelDescription: string;
    dashboardUrl: string;
}): {
    subject: string;
    html: string;
};
