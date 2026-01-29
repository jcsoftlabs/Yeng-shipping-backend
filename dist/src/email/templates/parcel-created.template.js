"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParcelCreatedEmailTemplate = getParcelCreatedEmailTemplate;
function getParcelCreatedEmailTemplate(data) {
    const subject = `🎉 Votre colis a été enregistré - ${data.trackingNumber}`;
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colis enregistré</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E63946, #F77F00); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                🎉 Votre colis a été enregistré !
            </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff;">
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour <strong>${data.customerName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 30px 0;">
                Votre colis a été enregistré avec succès dans notre système. Vous pouvez maintenant suivre son parcours en temps réel.
            </p>

            <!-- Tracking Number Card -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 0 0 25px 0; border-left: 4px solid #E63946;">
                <p style="color: #666; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Numéro de suivi
                </p>
                <h2 style="color: #E63946; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
                    ${data.trackingNumber}
                </h2>
            </div>

            <!-- Parcel Details -->
            <div style="background: #ffffff; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border: 2px solid #e9ecef;">
                <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                    📦 Détails du colis
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #f0f0f0;">
                            Description
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #f0f0f0;">
                            ${data.description}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #f0f0f0;">
                            Poids
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #f0f0f0;">
                            ${data.weight} lbs
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px;">
                            Valeur déclarée
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px;">
                            $${data.declaredValue.toFixed(2)}
                        </td>
                    </tr>
                </table>
            </div>

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
                    📦 Suivre mon colis
                </a>
            </div>

            <!-- Info Box -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 30px 0 0 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                    <strong>💡 Astuce :</strong> Vous recevrez un email à chaque changement de statut de votre colis.
                </p>
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
//# sourceMappingURL=parcel-created.template.js.map