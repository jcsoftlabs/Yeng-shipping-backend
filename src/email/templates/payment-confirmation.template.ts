export function getPaymentConfirmationEmailTemplate(data: {
    customerName: string;
    trackingNumber: string;
    paymentAmount: number;
    paymentMethod: string;
    paymentDate: string;
    receiptNumber: string;
    parcelDescription: string;
    dashboardUrl: string;
}): { subject: string; html: string } {
    const subject = `✅ Paiement confirmé - ${data.trackingNumber}`;

    const paymentMethodLabels: Record<string, string> = {
        'CASH': 'Espèces',
        'MONCASH': 'MonCash',
        'CARD': 'Carte bancaire',
        'BANK_TRANSFER': 'Virement bancaire',
    };

    const paymentMethodLabel = paymentMethodLabels[data.paymentMethod] || data.paymentMethod;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de paiement</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #198754, #20c997); padding: 40px 20px; text-align: center;">
            <img src="https://www.yengshipping.delivery/logo.png" alt="Yeng Shipping" style="width: 120px; height: auto; margin-bottom: 15px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                Paiement Confirmé !
            </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff;">
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour <strong>${data.customerName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 30px 0;">
                Nous avons bien reçu votre paiement. Votre colis est maintenant <strong>prêt pour récupération</strong> !
            </p>

            <!-- Payment Summary Card -->
            <div style="background: linear-gradient(135deg, #198754, #20c997); padding: 30px; border-radius: 12px; margin: 0 0 30px 0; box-shadow: 0 4px 15px rgba(25, 135, 84, 0.3);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">
                        💰 Montant Payé
                    </h2>
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 36px; color: #198754; font-weight: bold;">
                            ${data.paymentAmount.toFixed(2)} USD
                        </p>
                    </div>
                </div>
            </div>

            <!-- Payment Details -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border: 2px solid #e9ecef;">
                <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                    📋 Détails du paiement
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            Numéro de reçu
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #e9ecef; font-family: monospace;">
                            ${data.receiptNumber}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            Numéro de suivi
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #e9ecef; font-family: monospace;">
                            ${data.trackingNumber}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            Colis
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            ${data.parcelDescription}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            Méthode de paiement
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            ${paymentMethodLabel}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px;">
                            Date de paiement
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px;">
                            ${data.paymentDate}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Next Steps -->
            <div style="background: #cff4fc; padding: 25px; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #0dcaf0;">
                <h3 style="color: #055160; margin: 0 0 15px 0; font-size: 18px;">
                    🎉 Prochaine étape : Récupération
                </h3>
                <p style="margin: 0; color: #055160; font-size: 15px; line-height: 1.6;">
                    Votre colis est maintenant prêt ! Vous pouvez venir le récupérer à notre entrepôt en Haïti. N'oubliez pas d'apporter une pièce d'identité.
                </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${data.dashboardUrl}" 
                   style="background: linear-gradient(135deg, #E63946, #F77F00); 
                          color: white; 
                          padding: 16px 45px; 
                          text-decoration: none; 
                          border-radius: 30px; 
                          font-weight: bold;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);">
                    📦 Voir mon colis
                </a>
            </div>

            <!-- Thank You -->
            <div style="text-align: center; padding: 30px 0 0 0; border-top: 2px solid #e9ecef;">
                <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                    Merci d'avoir choisi <strong style="color: #E63946;">Yeng Shipping</strong> ! 🙏
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
            <p style="margin: 0; font-size: 13px; opacity: 0.7;">
                📧 support@yengshipping.delivery
            </p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, html };
}
