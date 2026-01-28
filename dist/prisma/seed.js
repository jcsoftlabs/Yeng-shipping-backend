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