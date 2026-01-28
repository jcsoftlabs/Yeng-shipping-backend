"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
let ReceiptService = class ReceiptService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateThermalReceipt(paymentId) {
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
            const doc = new pdfkit_1.default({
                size: [164, 600],
                margins: { top: 10, bottom: 10, left: 10, right: 10 },
            });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            try {
                const logoPath = require.resolve('../../assets/logo.png');
                doc.image(logoPath, 52, doc.y, { width: 60, fit: [60, 60] });
                doc.moveDown(4);
            }
            catch (e) {
            }
            doc.fontSize(10).font('Helvetica-Bold').text('YENG SHIPPING', { align: 'center' });
            doc.fontSize(8).font('Helvetica').text('SERVICE', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(7).text('+509 3641 1990', { align: 'center' });
            doc.text('7829 NW 72nd Ave', { align: 'center' });
            doc.text('Miami, FL 33166', { align: 'center' });
            doc.moveDown(0.5);
            doc.text('================================', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(9).font('Helvetica-Bold').text('REÇU DE PAIEMENT', { align: 'center' });
            doc.moveDown(0.5);
            const now = new Date();
            doc.fontSize(7).font('Helvetica');
            doc.text(`Date: ${now.toLocaleDateString('fr-FR')}`, { align: 'left' });
            doc.text(`Heure: ${now.toLocaleTimeString('fr-FR')}`, { align: 'left' });
            doc.moveDown(0.5);
            doc.fontSize(8).font('Helvetica-Bold').text('CLIENT:');
            doc.fontSize(7).font('Helvetica');
            doc.text(`${payment.parcel.customer.firstName} ${payment.parcel.customer.lastName}`);
            doc.text(`Code: ${payment.parcel.customer.customAddress}`);
            doc.moveDown(0.5);
            doc.fontSize(8).font('Helvetica-Bold').text('COLIS:');
            doc.fontSize(7).font('Helvetica');
            doc.text(`Tracking: ${payment.parcel.trackingNumber}`);
            doc.text(`Description: ${payment.parcel.description}`);
            doc.text(`Poids: ${payment.parcel.weight} lbs`);
            doc.moveDown(0.5);
            doc.text('--------------------------------', { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(8).font('Helvetica-Bold').text('DÉTAILS DU PAIEMENT:');
            doc.fontSize(7).font('Helvetica');
            doc.text(`Méthode: ${payment.method}`);
            if (payment.reference) {
                doc.text(`Référence: ${payment.reference}`);
            }
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`MONTANT: $${payment.amount.toFixed(2)}`, { align: 'center' });
            doc.moveDown(0.3);
            const totalPaid = payment.parcel.payments?.reduce((sum, p) => sum + p.amount, 0) || payment.amount;
            const balance = payment.parcel.totalAmount - totalPaid;
            doc.fontSize(7).font('Helvetica');
            doc.text(`Total colis: $${payment.parcel.totalAmount.toFixed(2)}`);
            doc.text(`Total payé: $${totalPaid.toFixed(2)}`);
            doc.text(`Solde: $${balance.toFixed(2)}`);
            doc.moveDown(0.5);
            doc.text('--------------------------------', { align: 'center' });
            doc.moveDown(0.3);
            if (balance <= 0) {
                doc.fontSize(8).font('Helvetica-Bold').text('✓ PAYÉ INTÉGRALEMENT', { align: 'center' });
                doc.fontSize(7).font('Helvetica').text('Colis prêt pour récupération', { align: 'center' });
            }
            else {
                doc.fontSize(8).font('Helvetica-Bold').text('PAIEMENT PARTIEL', { align: 'center' });
            }
            doc.moveDown(0.5);
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
};
exports.ReceiptService = ReceiptService;
exports.ReceiptService = ReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceiptService);
//# sourceMappingURL=receipt.service.js.map