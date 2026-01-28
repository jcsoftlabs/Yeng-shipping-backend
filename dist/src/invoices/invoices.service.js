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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
const nodemailer = __importStar(require("nodemailer"));
let InvoicesService = class InvoicesService {
    prisma;
    transporter;
    constructor(prisma) {
        this.prisma = prisma;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.customerId) {
            where.parcel = { customerId: filters.customerId };
        }
        if (filters?.status) {
            where.parcel = { ...where.parcel, paymentStatus: filters.status };
        }
        if (filters?.search) {
            where.OR = [
                { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
                { parcel: { trackingNumber: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }
        const invoices = await this.prisma.invoice.findMany({
            where,
            include: {
                parcel: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                customAddress: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return invoices;
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                parcel: {
                    include: {
                        customer: true,
                        payments: {
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Facture non trouvée');
        }
        return invoice;
    }
    async generatePDF(id) {
        const invoice = await this.findOne(id);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            doc.fontSize(20).text('YENG SHIPPING', { align: 'center' });
            doc.fontSize(10).text('7829 NW 72nd Ave, Miami, FL 33166', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text('FACTURE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10);
            doc.text(`Numéro: ${invoice.invoiceNumber}`);
            doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`);
            doc.text(`Tracking: ${invoice.parcel.trackingNumber}`);
            doc.moveDown();
            doc.fontSize(12).text('CLIENT:', { underline: true });
            doc.fontSize(10);
            doc.text(`${invoice.parcel.customer.firstName} ${invoice.parcel.customer.lastName}`);
            doc.text(`Email: ${invoice.parcel.customer.email}`);
            doc.text(`Adresse: ${invoice.parcel.customer.customAddress}`);
            doc.moveDown();
            doc.fontSize(12).text('DÉTAILS DU COLIS:', { underline: true });
            doc.fontSize(10);
            doc.text(`Description: ${invoice.parcel.description}`);
            doc.text(`Poids: ${invoice.parcel.weight} lbs`);
            doc.text(`Valeur déclarée: $${invoice.parcel.declaredValue.toFixed(2)}`);
            doc.moveDown();
            doc.fontSize(12).text('TARIFICATION:', { underline: true });
            doc.fontSize(10);
            const tableTop = doc.y;
            doc.text('Frais d\'expédition:', 50, tableTop);
            doc.text(`$${invoice.parcel.shippingFee.toFixed(2)}`, 400, tableTop, { align: 'right' });
            if (invoice.parcel.discount > 0) {
                doc.text('Réduction:', 50);
                doc.text(`-$${invoice.parcel.discount.toFixed(2)}`, 400, doc.y - 12, { align: 'right' });
            }
            doc.text('Taxes:', 50);
            doc.text(`$${invoice.parcel.taxAmount.toFixed(2)}`, 400, doc.y - 12, { align: 'right' });
            doc.moveDown();
            doc.fontSize(14).text('TOTAL:', 50, doc.y, { continued: true });
            doc.text(`$${invoice.parcel.totalAmount.toFixed(2)}`, { align: 'right' });
            doc.moveDown();
            doc.fontSize(10);
            const paidAmount = invoice.parcel.payments.reduce((sum, p) => sum + p.amount, 0);
            const balance = invoice.parcel.totalAmount - paidAmount;
            doc.text(`Montant payé: $${paidAmount.toFixed(2)}`);
            doc.text(`Solde restant: $${balance.toFixed(2)}`);
            doc.text(`Statut: ${invoice.parcel.paymentStatus}`);
            doc.moveDown(2);
            doc.fontSize(8).text('Merci de votre confiance!', { align: 'center' });
            doc.text('Pour toute question, contactez-nous à contact@yengshipping.com', { align: 'center' });
            doc.end();
        });
    }
    async sendEmail(id) {
        const invoice = await this.findOne(id);
        const pdfBuffer = await this.generatePDF(id);
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@yengshipping.com',
            to: invoice.parcel.customer.email,
            subject: `Facture ${invoice.invoiceNumber} - Yeng Shipping`,
            html: `
                <h2>Bonjour ${invoice.parcel.customer.firstName} ${invoice.parcel.customer.lastName},</h2>
                <p>Veuillez trouver ci-joint votre facture pour le colis <strong>${invoice.parcel.trackingNumber}</strong>.</p>
                <p><strong>Montant total:</strong> $${invoice.parcel.totalAmount.toFixed(2)}</p>
                <p><strong>Statut:</strong> ${invoice.parcel.paymentStatus}</p>
                <br>
                <p>Merci de votre confiance!</p>
                <p>L'équipe Yeng Shipping</p>
            `,
            attachments: [
                {
                    filename: `facture-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        };
        await this.transporter.sendMail(mailOptions);
        return { message: 'Email envoyé avec succès' };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map