export function getInvoiceEmailTemplate(data: {
    customerName: string;
    invoiceNumber: string;
    trackingNumber: string;
    invoiceDate: string;
    totalAmount: number;
    parcelDescription: string;
}): { subject: string; html: string } {
    const subject = `📄 Facture ${data.invoiceNumber} - ${data.trackingNumber}`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6610f2, #6f42c1); padding: 40px 20px; text-align: center;">
            <img src="https://www.yengshipping.delivery/logo.png" alt="Yeng Shipping" style="width: 120px; height: auto; margin-bottom: 15px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                Votre Facture
            </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff;">
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour <strong>${data.customerName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 30px 0;">
                Veuillez trouver ci-joint votre facture pour le colis <strong>${data.trackingNumber}</strong>.
            </p>

            <!-- Invoice Summary Card -->
            <div style="background: linear-gradient(135deg, #6610f2, #6f42c1); padding: 30px; border-radius: 12px; margin: 0 0 30px 0; box-shadow: 0 4px 15px rgba(102, 16, 242, 0.3);">
                <div style="text-align: center;">
                    <h2 style="color: white; margin: 0 0 20px 0; font-size: 22px;">
                        Facture N° ${data.invoiceNumber}
                    </h2>
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">
                            Montant total
                        </p>
                        <p style="margin: 0; font-size: 32px; color: #6610f2; font-weight: bold;">
                            ${data.totalAmount.toFixed(2)} HTG
                        </p>
                    </div>
                </div>
            </div>

            <!-- Invoice Details -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 0 0 30px 0; border: 2px solid #e9ecef;">
                <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                    📋 Détails de la facture
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            Numéro de facture
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #e9ecef; font-family: monospace;">
                            ${data.invoiceNumber}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #666; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            Date d'émission
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px; border-bottom: 1px solid #e9ecef;">
                            ${data.invoiceDate}
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
                        <td style="padding: 12px 0; color: #666; font-size: 15px;">
                            Description
                        </td>
                        <td style="padding: 12px 0; color: #333; font-weight: 600; text-align: right; font-size: 15px;">
                            ${data.parcelDescription}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- PDF Attachment Notice -->
            <div style="background: #e7f3ff; padding: 25px; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #0d6efd;">
                <div style="display: table; width: 100%;">
                    <div style="display: table-cell; width: 50px; vertical-align: middle;">
                        <div style="font-size: 32px;">📎</div>
                    </div>
                    <div style="display: table-cell; vertical-align: middle; padding-left: 15px;">
                        <h4 style="margin: 0 0 5px 0; color: #084298; font-size: 16px;">
                            Facture PDF jointe
                        </h4>
                        <p style="margin: 0; color: #084298; font-size: 14px; line-height: 1.5;">
                            Votre facture détaillée au format PDF est jointe à cet email. Vous pouvez la télécharger et l'imprimer si nécessaire.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Info Box -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 30px 0 0 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                    <strong>💡 Besoin d'aide ?</strong> Si vous avez des questions concernant cette facture, n'hésitez pas à nous contacter à support@yengshipping.com
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
            <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.7;">
                📍 7829 NW 72nd Ave, Miami, FL 33166, USA
            </p>
            <p style="margin: 0; font-size: 13px; opacity: 0.7;">
                📧 support@yengshipping.com
            </p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, html };
}
