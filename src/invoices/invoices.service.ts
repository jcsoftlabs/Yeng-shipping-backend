import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvoicesService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async findAll(filters?: { customerId?: string; status?: string; search?: string }) {
        const where: any = {};

        if (filters?.customerId) {
            where.parcel = { customerId: filters.customerId };
        }

        if (filters?.status) {
            where.parcel = { ...where.parcel, paymentStatus: filters.status };
        }

        if (filters?.search) {
            where.OR = [
                { invoiceNumber: { contains: filters.search, mode: 'insensitive' as const } },
                { parcel: { trackingNumber: { contains: filters.search, mode: 'insensitive' as const } } },
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
                                fullUSAAddress: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return invoices;
    }

    async findOne(id: string) {
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
            throw new NotFoundException('Facture non trouvée');
        }

        return invoice;
    }

    async generatePDF(id: string): Promise<Buffer> {
        const invoice = await this.findOne(id);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header with Logo
            const logoPath = require('path').join(__dirname, '../assets/logo.png');
            if (require('fs').existsSync(logoPath)) {
                doc.image(logoPath, 50, 45, { width: 60 });
            }

            doc.fontSize(20).text('YENG SHIPPING', 120, 50);
            doc.fontSize(10).text('7829 NW 72nd Ave, Miami, FL 33166', 120, 75);
            doc.text('+509 3641 1990', 120, 90);
            doc.moveDown(2);

            // Invoice Info
            doc.fontSize(16).text('FACTURE', { align: 'center' });
            doc.moveDown();

            doc.fontSize(10);
            doc.text(`Numéro: ${invoice.invoiceNumber}`);
            doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`);
            doc.text(`Tracking: ${invoice.parcel.trackingNumber}`);
            doc.moveDown();

            // Customer Info
            doc.fontSize(12).text('CLIENT:', { underline: true });
            doc.fontSize(10);
            doc.text(`${invoice.parcel.customer.firstName} ${invoice.parcel.customer.lastName}`);
            doc.text(`Email: ${invoice.parcel.customer.email}`);
            doc.text(`Adresse: ${invoice.parcel.customer.customAddress}`);
            doc.moveDown();

            // Parcel Details
            doc.fontSize(12).text('DÉTAILS DU COLIS:', { underline: true });
            doc.fontSize(10);
            doc.text(`Description: ${invoice.parcel.description}`);
            doc.text(`Poids: ${invoice.parcel.weight} lbs`);
            doc.text(`Valeur déclarée: $${invoice.parcel.declaredValue.toFixed(2)}`);
            doc.moveDown();

            // Pricing Table
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

            // Payment Status
            doc.moveDown();
            doc.fontSize(10);
            const paidAmount = invoice.parcel.payments.reduce((sum, p) => sum + p.amount, 0);
            const balance = invoice.parcel.totalAmount - paidAmount;

            doc.text(`Montant payé: $${paidAmount.toFixed(2)}`);
            doc.text(`Solde restant: $${balance.toFixed(2)}`);
            doc.text(`Statut: ${invoice.parcel.paymentStatus}`);

            // Footer
            doc.moveDown(2);
            doc.fontSize(8).text('Merci de votre confiance!', { align: 'center' });
            doc.text('Pour toute question, contactez-nous à contact@yengshipping.com', { align: 'center' });

            doc.end();
        });
    }

    async sendEmail(id: string) {
        const invoice = await this.findOne(id);
        const pdfBuffer = await this.generatePDF(id);

        await this.emailService.sendInvoiceEmail({
            customer: {
                ...invoice.parcel.customer,
                customAddress: invoice.parcel.customer.customAddress || undefined,
                fullUSAAddress: invoice.parcel.customer.fullUSAAddress || undefined,
            },
            invoiceNumber: invoice.invoiceNumber,
            trackingNumber: invoice.parcel.trackingNumber,
            invoiceDate: new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
            totalAmount: invoice.parcel.totalAmount,
            parcelDescription: invoice.parcel.description,
            pdfBuffer: pdfBuffer,
        });

        return { message: 'Email envoyé avec succès' };
    }
}
