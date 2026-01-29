"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const parcel_created_template_1 = require("./templates/parcel-created.template");
const parcel_status_updated_template_1 = require("./templates/parcel-status-updated.template");
const welcome_template_1 = require("./templates/welcome.template");
const password_reset_template_1 = require("./templates/password-reset.template");
const payment_confirmation_template_1 = require("./templates/payment-confirmation.template");
const invoice_template_1 = require("./templates/invoice.template");
let EmailService = EmailService_1 = class EmailService {
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    frontendUrl;
    constructor() {
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('✅ Email service is ready to send emails');
        }
        catch (error) {
            this.logger.error('❌ Email service configuration error:', error);
            this.logger.warn('Emails will not be sent until SMTP credentials are configured');
        }
    }
    async sendWelcomeEmail(customer) {
        try {
            const customerName = `${customer.firstName} ${customer.lastName}`;
            const dashboardUrl = `${this.frontendUrl}/dashboard`;
            const { subject, html } = (0, welcome_template_1.getWelcomeEmailTemplate)({
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
        }
        catch (error) {
            this.logger.error(`❌ Failed to send welcome email to ${customer.email}:`, error);
        }
    }
    async sendParcelCreatedEmail(parcel) {
        try {
            const customerName = `${parcel.customer.firstName} ${parcel.customer.lastName}`;
            const trackingUrl = `${this.frontendUrl}/track?tracking=${parcel.trackingNumber}`;
            const { subject, html } = (0, parcel_created_template_1.getParcelCreatedEmailTemplate)({
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
        }
        catch (error) {
            this.logger.error(`❌ Failed to send parcel created email for ${parcel.trackingNumber}:`, error);
        }
    }
    async sendParcelStatusUpdatedEmail(parcel, oldStatus, newStatus) {
        try {
            const customerName = `${parcel.customer.firstName} ${parcel.customer.lastName}`;
            const trackingUrl = `${this.frontendUrl}/track?tracking=${parcel.trackingNumber}`;
            const { subject, html } = (0, parcel_status_updated_template_1.getParcelStatusUpdatedEmailTemplate)({
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
            this.logger.log(`✅ Status update email sent to ${parcel.customer.email} for ${parcel.trackingNumber} (${oldStatus} → ${newStatus})`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to send status update email for ${parcel.trackingNumber}:`, error);
        }
    }
    async sendPasswordResetEmail(customer, resetToken, expiresInMinutes = 30) {
        try {
            const customerName = `${customer.firstName} ${customer.lastName}`;
            const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
            const expiresIn = `${expiresInMinutes} minutes`;
            const { subject, html } = (0, password_reset_template_1.getPasswordResetEmailTemplate)({
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
        }
        catch (error) {
            this.logger.error(`❌ Failed to send password reset email to ${customer.email}:`, error);
            throw error;
        }
    }
    async sendPaymentConfirmationEmail(data) {
        try {
            const customerName = `${data.customer.firstName} ${data.customer.lastName}`;
            const dashboardUrl = `${this.frontendUrl}/dashboard`;
            const { subject, html } = (0, payment_confirmation_template_1.getPaymentConfirmationEmailTemplate)({
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
            this.logger.log(`✅ Payment confirmation email sent to ${data.customer.email} for ${data.trackingNumber}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to send payment confirmation email to ${data.customer.email}:`, error);
        }
    }
    async sendInvoiceEmail(data) {
        try {
            const customerName = `${data.customer.firstName} ${data.customer.lastName}`;
            const { subject, html } = (0, invoice_template_1.getInvoiceEmailTemplate)({
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
            this.logger.log(`✅ Invoice email sent to ${data.customer.email} for invoice ${data.invoiceNumber}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to send invoice email to ${data.customer.email}:`, error);
        }
    }
    async sendTestEmail(to) {
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
        }
        catch (error) {
            this.logger.error(`❌ Failed to send test email to ${to}:`, error);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map