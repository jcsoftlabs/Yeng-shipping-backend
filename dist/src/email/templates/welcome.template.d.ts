export declare function getWelcomeEmailTemplate(data: {
    customerName: string;
    email: string;
    customAddress: string;
    fullUSAAddress: string;
    dashboardUrl: string;
}): {
    subject: string;
    html: string;
};
