export declare function getPasswordResetEmailTemplate(data: {
    customerName: string;
    resetToken: string;
    resetUrl: string;
    expiresIn: string;
}): {
    subject: string;
    html: string;
};
