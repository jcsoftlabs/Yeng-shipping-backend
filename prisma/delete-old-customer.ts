import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🗑️  Deleting old customer...');

    // Delete old customer and their parcels
    await prisma.parcel.deleteMany({
        where: {
            customer: {
                email: 'jean.pierre@example.com'
            }
        }
    });

    await prisma.customer.deleteMany({
        where: {
            email: 'jean.pierre@example.com'
        }
    });

    console.log('✅ Old customer deleted');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
