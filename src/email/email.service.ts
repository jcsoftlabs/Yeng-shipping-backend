import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);
    private readonly frontendUrl: string;

    constructor() {
        // Get frontend URL from environment or use default
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

        // Configure email transporter with Gmail SMTP
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify transporter configuration
        this.verifyConnection();
    }

    private async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('✅ Email service is ready to send emails');
        } catch (error) {
            this.logger.error('❌ Email service configuration error:', error);
            this.logger.warn('Emails will not be sent until SMTP credentials are configured');
        }
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

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: customer.email,
                subject,
                html,
            });

            this.logger.log(`✅ Welcome email sent to ${customer.email}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send welcome email to ${customer.email}:`, error);
            // Don't throw - we don't want email failures to block registration
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

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: parcel.customer.email,
                subject,
                html,
            });

            this.logger.log(`✅ Parcel created email sent to ${parcel.customer.email} for ${parcel.trackingNumber}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send parcel created email for ${parcel.trackingNumber}:`, error);
            // Don't throw - we don't want email failures to block parcel creation
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

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: parcel.customer.email,
                subject,
                html,
            });

            this.logger.log(
                `✅ Status update email sent to ${parcel.customer.email} for ${parcel.trackingNumber} (${oldStatus} → ${newStatus})`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Failed to send status update email for ${parcel.trackingNumber}:`,
                error,
            );
            // Don't throw - we don't want email failures to block status updates
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

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: customer.email,
                subject,
                html,
            });

            this.logger.log(`✅ Password reset email sent to ${customer.email}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send password reset email to ${customer.email}:`, error);
            throw error; // Throw here because password reset should fail if email fails
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

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: data.customer.email,
                subject,
                html,
            });

            this.logger.log(
                `✅ Payment confirmation email sent to ${data.customer.email} for ${data.trackingNumber}`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Failed to send payment confirmation email to ${data.customer.email}:`,
                error,
            );
            // Don't throw - payment is already processed
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

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: data.customer.email,
                subject,
                html,
                attachments: [
                    {
                        filename: `Facture_${data.invoiceNumber}.pdf`,
                        content: data.pdfBuffer,
                        contentType: 'application/pdf',
                    },
                ],
            });

            this.logger.log(
                `✅ Invoice email sent to ${data.customer.email} for invoice ${data.invoiceNumber}`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Failed to send invoice email to ${data.customer.email}:`,
                error,
            );
            // Don't throw - invoice is already generated
        }
    }

    /**
     * Send a test email to verify configuration
     */
    async sendTestEmail(to: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to,
                subject: '✅ Yeng Shipping - Test Email',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #E63946;">✅ Email Configuration Successful!</h2>
                        <p>This is a test email from Yeng Shipping backend.</p>
                        <p>If you received this, your email configuration is working correctly.</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #666; font-size: 12px;">
                            Yeng Shipping - Expédition USA-Haiti Simplifiée
                        </p>
                    </div>
                `,
            });

            this.logger.log(`✅ Test email sent successfully to ${to}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send test email to ${to}:`, error);
            throw error;
        }
    }
}
