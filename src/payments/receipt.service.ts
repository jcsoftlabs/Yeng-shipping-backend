import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptService {
    constructor(private prisma: PrismaService) { }

    async generateThermalReceipt(paymentId: string): Promise<Buffer> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                parcel: {
                    include: {
                        customer: true,
                        payments: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new Error('Paiement non trouvé');
        }

        return new Promise((resolve, reject) => {
            // Create PDF optimized for thermal printer (58mm = 164px width)
            const doc = new PDFDocument({
                size: [164, 600], // 58mm width, variable height
                margins: { top: 10, bottom: 10, left: 10, right: 10 },
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Company Header
            doc.fontSize(10).font('Helvetica-Bold').text('YENG SHIPPING', { align: 'center' });
            doc.fontSize(8).font('Helvetica').text('SERVICE', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(7).text('+509 3641 1990', { align: 'center' });
            doc.text('7829 NW 72nd Ave', { align: 'center' });
            doc.text('Miami, FL 33166', { align: 'center' });
            doc.moveDown(0.5);

            // Separator
            doc.text('================================', { align: 'center' });
            doc.moveDown(0.3);

            // Receipt Title
            doc.fontSize(9).font('Helvetica-Bold').text('REÇU DE PAIEMENT', { align: 'center' });
            doc.moveDown(0.5);

            // Date and Time
            const now = new Date();
            doc.fontSize(7).font('Helvetica');
            doc.text(`Date: ${now.toLocaleDateString('fr-FR')}`, { align: 'left' });
            doc.text(`Heure: ${now.toLocaleTimeString('fr-FR')}`, { align: 'left' });
            doc.moveDown(0.5);

            // Customer Info
            doc.fontSize(8).font('Helvetica-Bold').text('CLIENT:');
            doc.fontSize(7).font('Helvetica');
            doc.text(`${payment.parcel.customer.firstName} ${payment.parcel.customer.lastName}`);
            doc.text(`Code: ${payment.parcel.customer.customAddress}`);
            doc.moveDown(0.5);

            // Parcel Info
            doc.fontSize(8).font('Helvetica-Bold').text('COLIS:');
            doc.fontSize(7).font('Helvetica');
            doc.text(`Tracking: ${payment.parcel.trackingNumber}`);
            doc.text(`Description: ${payment.parcel.description}`);
            doc.text(`Poids: ${payment.parcel.weight} lbs`);
            doc.moveDown(0.5);

            // Payment Info
            doc.text('--------------------------------', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(8).font('Helvetica-Bold').text('DÉTAILS DU PAIEMENT:');
            doc.fontSize(7).font('Helvetica');
            doc.text(`Méthode: ${payment.method}`);
            if (payment.reference) {
                doc.text(`Référence: ${payment.reference}`);
            }
            doc.moveDown(0.3);

            // Amount
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`MONTANT: $${payment.amount.toFixed(2)}`, { align: 'center' });
            doc.moveDown(0.3);

            // Total parcel amount and balance
            const totalPaid = payment.parcel.payments?.reduce((sum, p) => sum + p.amount, 0) || payment.amount;
            const balance = payment.parcel.totalAmount - totalPaid;

            doc.fontSize(7).font('Helvetica');
            doc.text(`Total colis: $${payment.parcel.totalAmount.toFixed(2)}`);
            doc.text(`Total payé: $${totalPaid.toFixed(2)}`);
            doc.text(`Solde: $${balance.toFixed(2)}`);
            doc.moveDown(0.5);

            // Status
            doc.text('--------------------------------', { align: 'center' });
            doc.moveDown(0.3);
            if (balance <= 0) {
                doc.fontSize(8).font('Helvetica-Bold').text('✓ PAYÉ INTÉGRALEMENT', { align: 'center' });
                doc.fontSize(7).font('Helvetica').text('Colis prêt pour récupération', { align: 'center' });
            } else {
                doc.fontSize(8).font('Helvetica-Bold').text('PAIEMENT PARTIEL', { align: 'center' });
            }
            doc.moveDown(0.5);

            // Footer
            doc.text('--------------------------------', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(6).font('Helvetica');
            doc.text('Merci de votre confiance!', { align: 'center' });
            doc.text('Conservez ce reçu', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(5).text(`Reçu #${payment.id.substring(0, 8).toUpperCase()}`, { align: 'center' });

            doc.end();
        });
    }
}
