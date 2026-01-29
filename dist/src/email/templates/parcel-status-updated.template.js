"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParcelStatusUpdatedEmailTemplate = getParcelStatusUpdatedEmailTemplate;
const status_labels_1 = require("./status-labels");
function getParcelStatusUpdatedEmailTemplate(data) {
    const subject = `📦 Mise à jour de votre colis - ${data.trackingNumber}`;
    const oldStatusLabel = (0, status_labels_1.getStatusLabel)(data.oldStatus);
    const newStatusLabel = (0, status_labels_1.getStatusLabel)(data.newStatus);
    const statusColor = getStatusColor(data.newStatus);
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour du colis</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E63946, #F77F00); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                📦 Mise à jour de votre colis
            </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff;">
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour <strong>${data.customerName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 30px 0;">
                Le statut de votre colis <strong>${data.trackingNumber}</strong> a été mis à jour.
            </p>

            <!-- Status Change Card -->
            <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin: 0 0 25px 0;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Changement de statut
                    </p>
                    
                    <!-- Old Status -->
                    <div style="display: inline-block; margin: 0 10px;">
                        <span style="background: #e9ecef; color: #6c757d; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                            ${oldStatusLabel}
                        </span>
                    </div>
                    
                    <!-- Arrow -->
                    <div style="display: inline-block; margin: 0 10px; color: #E63946; font-size: 24px; font-weight: bold;">
                        →
                    </div>
                    
                    <!-- New Status -->
                    <div style="display: inline-block; margin: 0 10px;">
                        <span style="background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                            ${newStatusLabel}
                        </span>
                    </div>
                </div>

                ${data.currentLocation ? `
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">
                        📍 Localisation actuelle
                    </p>
                    <p style="color: #333; margin: 0; font-size: 16px; font-weight: 600;">
                        ${data.currentLocation}
                    </p>
                </div>
                ` : ''}
            </div>

            <!-- Next Steps -->
            ${getNextStepsMessage(data.newStatus)}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${data.trackingUrl}" 
                   style="background: linear-gradient(135deg, #E63946, #F77F00); 
                          color: white; 
                          padding: 16px 45px; 
                          text-decoration: none; 
                          border-radius: 30px; 
                          font-weight: bold;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);">
                    📦 Voir le parcours complet
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a1a; color: white; padding: 30px 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                Yeng Shipping
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">
                Expédition USA-Haiti Simplifiée
            </p>
            <p style="margin: 0; font-size: 13px; opacity: 0.7; line-height: 1.5;">
                7829 NW 72nd Ave, Miami, FL 33166, USA
            </p>
        </div>
    </div>
</body>
</html>
    `;
    return { subject, html };
}
function getStatusColor(status) {
    const colors = {
        'PENDING': '#ffc107',
        'IN_TRANSIT_USA': '#0d6efd',
        'DEPARTED_USA': '#6610f2',
        'IN_TRANSIT_HAITI': '#6f42c1',
        'ARRIVED_HAITI': '#d63384',
        'READY_FOR_PICKUP': '#0dcaf0',
        'PICKED_UP': '#198754',
        'CANCELLED': '#dc3545',
    };
    return colors[status] || '#6c757d';
}
function getNextStepsMessage(status) {
    const messages = {
        'PENDING': `
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0d6efd;">
                <p style="margin: 0; color: #084298; font-size: 14px; line-height: 1.6;">
                    <strong>Prochaine étape :</strong> Votre colis sera bientôt pris en charge pour l'expédition vers Haiti.
                </p>
            </div>
        `,
        'IN_TRANSIT_USA': `
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0d6efd;">
                <p style="margin: 0; color: #084298; font-size: 14px; line-height: 1.6;">
                    <strong>Prochaine étape :</strong> Votre colis est en transit aux États-Unis et sera bientôt acheminé vers Haiti.
                </p>
            </div>
        `,
        'DEPARTED_USA': `
            <div style="background: #f3e7ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6610f2;">
                <p style="margin: 0; color: #3d0a91; font-size: 14px; line-height: 1.6;">
                    <strong>Prochaine étape :</strong> Votre colis a quitté les États-Unis et est en route vers Haiti.
                </p>
            </div>
        `,
        'IN_TRANSIT_HAITI': `
            <div style="background: #f3e7ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6f42c1;">
                <p style="margin: 0; color: #432874; font-size: 14px; line-height: 1.6;">
                    <strong>Prochaine étape :</strong> Votre colis est en transit vers notre entrepôt en Haiti.
                </p>
            </div>
        `,
        'ARRIVED_HAITI': `
            <div style="background: #ffe7f3; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d63384;">
                <p style="margin: 0; color: #801f4f; font-size: 14px; line-height: 1.6;">
                    <strong>Prochaine étape :</strong> Votre colis est arrivé en Haiti. Le paiement est requis pour la récupération.
                </p>
            </div>
        `,
        'READY_FOR_PICKUP': `
            <div style="background: #cff4fc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0dcaf0;">
                <p style="margin: 0; color: #055160; font-size: 14px; line-height: 1.6;">
                    <strong>🎉 Votre colis est prêt !</strong> Vous pouvez venir le récupérer à notre entrepôt.
                </p>
            </div>
        `,
        'PICKED_UP': `
            <div style="background: #d1e7dd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #198754;">
                <p style="margin: 0; color: #0a3622; font-size: 14px; line-height: 1.6;">
                    <strong>✅ Livraison complétée !</strong> Merci d'avoir utilisé Yeng Shipping. À bientôt !
                </p>
            </div>
        `,
        'CANCELLED': `
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc3545;">
                <p style="margin: 0; color: #842029; font-size: 14px; line-height: 1.6;">
                    <strong>Colis annulé.</strong> Contactez-nous pour plus d'informations.
                </p>
            </div>
        `,
    };
    return messages[status] || '';
}
//# sourceMappingURL=parcel-status-updated.template.js.map