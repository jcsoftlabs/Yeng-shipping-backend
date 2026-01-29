export declare function getParcelStatusUpdatedEmailTemplate(data: {
    customerName: string;
    trackingNumber: string;
    oldStatus: string;
    newStatus: string;
    currentLocation?: string;
    trackingUrl: string;
}): {
    subject: string;
    html: string;
};
