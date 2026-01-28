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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Seeding database...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@yengshipping.com' },
        update: {},
        create: {
            email: 'admin@yengshipping.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Yeng',
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user:', admin.email);
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.customer.upsert({
        where: { email: 'jean.pierre@example.com' },
        update: {},
        create: {
            email: 'jean.pierre@example.com',
            password: customerPassword,
            firstName: 'Jean',
            lastName: 'Pierre',
            phone: '+509 1234 5678',
            customAddress: 'YENGSHIPPINGP-Jean-4582',
            addressLine1: '123 Rue de la Paix',
            city: 'Port-au-Prince',
            country: 'Haiti',
        },
    });
    console.log('✅ Created test customer:', customer.email);
    console.log('   Custom address:', customer.customAddress);
    const parcel1 = await prisma.parcel.upsert({
        where: { trackingNumber: 'YNG-00000001' },
        update: {},
        create: {
            trackingNumber: 'YNG-00000001',
            barcode: 'BC-00000001',
            customerId: customer.id,
            senderName: 'John Smith',
            senderAddress: '123 Main Street',
            senderCity: 'Miami',
            senderState: 'FL',
            senderZipCode: '33101',
            senderCountry: 'USA',
            description: 'Electronics and clothing',
            weight: 15.5,
            length: 20,
            width: 15,
            height: 10,
            declaredValue: 250.00,
            status: 'IN_TRANSIT_HAITI',
            currentLocation: 'Port-au-Prince, Haiti',
            shippingFee: 82.50,
            taxAmount: 8.25,
            totalAmount: 90.75,
            paymentStatus: 'PAID',
            estimatedArrival: new Date('2026-02-05'),
        },
    });
    const parcel2 = await prisma.parcel.upsert({
        where: { trackingNumber: 'YNG-00000002' },
        update: {},
        create: {
            trackingNumber: 'YNG-00000002',
            barcode: 'BC-00000002',
            customerId: customer.id,
            senderName: 'Mary Johnson',
            senderAddress: '456 Oak Avenue',
            senderCity: 'Fort Lauderdale',
            senderState: 'FL',
            senderZipCode: '33301',
            senderCountry: 'USA',
            description: 'Books and household items',
            weight: 22.0,
            length: 24,
            width: 18,
            height: 12,
            declaredValue: 180.00,
            status: 'READY_FOR_PICKUP',
            currentLocation: 'Yeng Shipping - Port-au-Prince',
            shippingFee: 113.60,
            taxAmount: 11.36,
            totalAmount: 124.96,
            paymentStatus: 'PAID',
        },
    });
    console.log('✅ Created test parcels:');
    console.log('   Parcel 1:', parcel1.trackingNumber, '-', parcel1.status);
    console.log('   Parcel 2:', parcel2.trackingNumber, '-', parcel2.status);
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@yengshipping.com / admin123');
    console.log('   Customer: jean.pierre@example.com / customer123');
    console.log('\n✨ Seeding complete!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map