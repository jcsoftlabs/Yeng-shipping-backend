export declare function getParcelCreatedEmailTemplate(data: {
    customerName: string;
    trackingNumber: string;
    description: string;
    weight: number;
    declaredValue: number;
    trackingUrl: string;
}): {
    subject: string;
    html: string;
};
