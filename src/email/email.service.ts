import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { getParcelCreatedEmailTemplate } from './templates/parcel-created.template';
import { getParcelStatusUpdatedEmailTemplate } from './templates/parcel-status-updated.template';
import { getWelcomeEmailTemplate } from './templates/welcome.template';
import { getPasswordResetEmailTemplate } from './templates/password-reset.template';
import { getPaymentConfirmationEmailTemplate } from './templates/payment-confirmation.template';
import { getInvoiceEmailTemplate } from './templates/invoice.template';

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

@Injectable()
export class EmailService {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);
    private readonly frontendUrl: string;
    private readonly fromEmail: string;

    constructor() {
        // Get frontend URL from environment or use default
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

        // Initialize Resend with API Key
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('⚠️ RESEND_API_KEY is not defined. Emails will not be sent.');
        }
        this.resend = new Resend(apiKey);

        // Default sender - SHOULD be verified domain in Resend
        // Ideally: 'Yeng Shipping <notifications@yengshipping.com>'
        // For testing/onboarding: 'onboarding@resend.dev' works if sending to your own email
        this.fromEmail = process.env.EMAIL_FROM || 'Yeng Shipping <info@yengshipping.delivery>';
    }

    /**
     * Send welcome email to new customers after registration
     */
    async sendWelcomeEmail(customer: Customer): Promise<void> {
        try {
            const customerName = `${customer.firstName} ${customer.lastName}`;
            const dashboardUrl = `${this.frontendUrl}/dashboard`;

            const { subject, html } = getWelcomeEmailTemplate({
                customerName,
                email: customer.email,
                customAddress: customer.customAddress || '',
                fullUSAAddress: customer.fullUSAAddress || '',
                dashboardUrl,
            });

            await this.resend.emails.send({
                from: this.fromEmail,
                to: customer.email,
                subject,
                html,
            });

            this.logger.log(`✅ Welcome email sent to ${customer.email} via Resend`);
        } catch (error) {
            this.logger.error(`❌ Failed to send welcome email to ${customer.email}:`, error);
        }
    }

    /**
     * Send email notification when a new parcel is created
     */
    async sendParcelCreatedEmail(parcel: Parcel): Promise<void> {
        try {
            const customerName = `${parcel.customer.firstName} ${parcel.customer.lastName}`;
            const trackingUrl = `${this.frontendUrl}/track?tracking=${parcel.trackingNumber}`;

            const { subject, html } = getParcelCreatedEmailTemplate({
                customerName,
                trackingNumber: parcel.trackingNumber,
                description: parcel.description,
                weight: parcel.weight,
                declaredValue: parcel.declaredValue,
                trackingUrl,
            });

            await this.resend.emails.send({
                from: this.fromEmail,
                to: parcel.customer.email,
                subject,
                html,
            });

            this.logger.log(`✅ Parcel created email sent to ${parcel.customer.email} via Resend`);
        } catch (error) {
            this.logger.error(`❌ Failed to send parcel created email for ${parcel.trackingNumber}:`, error);
        }
    }

    /**
     * Send email notification when parcel status is updated
     */
    async sendParcelStatusUpdatedEmail(
        parcel: Parcel,
        oldStatus: string,
        newStatus: string,
    ): Promise<void> {
        try {
            const customerName = `${parcel.customer.firstName} ${parcel.customer.lastName}`;
            const trackingUrl = `${this.frontendUrl}/track?tracking=${parcel.trackingNumber}`;

            const { subject, html } = getParcelStatusUpdatedEmailTemplate({
                customerName,
                trackingNumber: parcel.trackingNumber,
                oldStatus,
                newStatus,
                currentLocation: parcel.currentLocation,
                trackingUrl,
            });

            await this.resend.emails.send({
                from: this.fromEmail,
                to: parcel.customer.email,
                subject,
                html,
            });

            this.logger.log(
                `✅ Status update email sent to ${parcel.customer.email} for ${parcel.trackingNumber} (${oldStatus} → ${newStatus}) via Resend`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Failed to send status update email for ${parcel.trackingNumber}:`,
                error,
            );
        }
    }

    /**
     * Send password reset email with reset token
     */
    async sendPasswordResetEmail(
        customer: Customer,
        resetToken: string,
        expiresInMinutes: number = 30,
    ): Promise<void> {
        try {
            const customerName = `${customer.firstName} ${customer.lastName}`;
            const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
            const expiresIn = `${expiresInMinutes} minutes`;

            const { subject, html } = getPasswordResetEmailTemplate({
                customerName,
                resetToken,
                resetUrl,
                expiresIn,
            });

            await this.resend.emails.send({
                from: this.fromEmail,
                to: customer.email,
                subject,
                html,
            });

            this.logger.log(`✅ Password reset email sent to ${customer.email} via Resend`);
        } catch (error) {
            this.logger.error(`❌ Failed to send password reset email to ${customer.email}:`, error);
            throw error;
        }
    }

    /**
     * Send payment confirmation email
     */
    async sendPaymentConfirmationEmail(data: {
        customer: Customer;
        trackingNumber: string;
        paymentAmount: number;
        paymentMethod: string;
        paymentDate: string;
        receiptNumber: string;
        parcelDescription: string;
    }): Promise<void> {
        try {
            const customerName = `${data.customer.firstName} ${data.customer.lastName}`;
            const dashboardUrl = `${this.frontendUrl}/dashboard`;

            const { subject, html } = getPaymentConfirmationEmailTemplate({
                customerName,
                trackingNumber: data.trackingNumber,
                paymentAmount: data.paymentAmount,
                paymentMethod: data.paymentMethod,
                paymentDate: data.paymentDate,
                receiptNumber: data.receiptNumber,
                parcelDescription: data.parcelDescription,
                dashboardUrl,
            });

            await this.resend.emails.send({
                from: this.fromEmail,
                to: data.customer.email,
                subject,
                html,
            });

            this.logger.log(
                `✅ Payment confirmation email sent to ${data.customer.email} for ${data.trackingNumber} via Resend`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Failed to send payment confirmation email to ${data.customer.email}:`,
                error,
            );
        }
    }

    /**
     * Send invoice email with PDF attachment
     */
    async sendInvoiceEmail(data: {
        customer: Customer;
        invoiceNumber: string;
        trackingNumber: string;
        invoiceDate: string;
        totalAmount: number;
        parcelDescription: string;
        pdfBuffer: Buffer;
    }): Promise<void> {
        try {
            const customerName = `${data.customer.firstName} ${data.customer.lastName}`;

            const { subject, html } = getInvoiceEmailTemplate({
                customerName,
                invoiceNumber: data.invoiceNumber,
                trackingNumber: data.trackingNumber,
                invoiceDate: data.invoiceDate,
                totalAmount: data.totalAmount,
                parcelDescription: data.parcelDescription,
            });

            await this.resend.emails.send({
                from: this.fromEmail,
                to: data.customer.email,
                subject,
                html,
                attachments: [
                    {
                        filename: `Facture_${data.invoiceNumber}.pdf`,
                        content: data.pdfBuffer,
                    },
                ],
            });

            this.logger.log(
                `✅ Invoice email sent to ${data.customer.email} for invoice ${data.invoiceNumber} via Resend`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Failed to send invoice email to ${data.customer.email}:`,
                error,
            );
        }
    }

    /**
     * Send a test email to verify configuration
     */
    async sendTestEmail(to: string): Promise<void> {
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject: '✅ Yeng Shipping - Resend Test',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #E63946;">✅ Resend Integration Successful!</h2>
                        <p>This is a test email from Yeng Shipping backend using Resend API.</p>
                        <p>If you received this, your email configuration works via Resend.</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 12px;">
                            Yeng Shipping - Expédition USA-Haiti Simplifiée
                        </p>
                    </div>
                `,
            });

            this.logger.log(`✅ Test email sent successfully to ${to} via Resend`);
        } catch (error) {
            this.logger.error(`❌ Failed to send test email to ${to}:`, error);
            throw error;
        }
    }
}
