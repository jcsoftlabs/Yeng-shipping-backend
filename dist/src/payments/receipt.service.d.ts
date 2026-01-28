import { PrismaService } from '../prisma/prisma.service';
export declare class ReceiptService {
    private prisma;
    constructor(prisma: PrismaService);
    generateThermalReceipt(paymentId: string): Promise<Buffer>;
}
