"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const TEST_EMAIL = 'jean.pierre@example.com';
    console.log(`🔄 Recherche du client de test : ${TEST_EMAIL}...`);
    try {
        const customer = await prisma.customer.findUnique({
            where: { email: TEST_EMAIL },
            include: {
                parcels: {
                    include: {
                        trackingEvents: true,
                        invoices: true,
                        payments: true
                    }
                }
            }
        });
        if (!customer) {
            console.log('❌ Client de test non trouvé.');
            return;
        }
        console.log(`✅ Client trouvé: ${customer.firstName} ${customer.lastName} (${customer.id})`);
        console.log(`📦 Nombre de colis à supprimer: ${customer.parcels.length}`);
        console.log('🗑️ Suppression des données en cours...');
        for (const parcel of customer.parcels) {
            if (parcel.trackingEvents && parcel.trackingEvents.length > 0) {
                await prisma.trackingEvent.deleteMany({
                    where: { parcelId: parcel.id }
                });
            }
            if (parcel.invoices && parcel.invoices.length > 0) {
                await prisma.invoice.deleteMany({
                    where: { parcelId: parcel.id }
                });
            }
            if (parcel.payments && parcel.payments.length > 0) {
                await prisma.payment.deleteMany({
                    where: { parcelId: parcel.id }
                });
            }
            await prisma.parcel.delete({
                where: { id: parcel.id }
            });
            console.log(`- Colis ${parcel.trackingNumber} supprimé`);
        }
        await prisma.customer.delete({
            where: { id: customer.id }
        });
        console.log('✅ Client et toutes ses données supprimés avec succès.');
    }
    catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=delete-test-user.js.map