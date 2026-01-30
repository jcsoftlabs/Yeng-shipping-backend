export function getWelcomeEmailTemplate(data: {
    customerName: string;
    email: string;
    customAddress: string;
    fullUSAAddress: string;
    dashboardUrl: string;
}): { subject: string; html: string } {
    const subject = `🎉 Bienvenue chez Yeng Shipping !`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez Yeng Shipping</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E63946, #F77F00); padding: 50px 20px; text-align: center;">
            <img src="https://www.yengshipping.delivery/logo.png" alt="Yeng Shipping" style="width: 150px; height: auto; margin-bottom: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">
                🎉 Bienvenue chez Yeng Shipping !
            </h1>
            <p style="color: white; margin: 0; font-size: 16px; opacity: 0.95;">
                Votre compte a été créé avec succès
            </p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff;">
            <p style="font-size: 18px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour <strong>${data.customerName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 30px 0;">
                Merci d'avoir rejoint <strong>Yeng Shipping</strong> ! Nous sommes ravis de vous accompagner dans l'expédition de vos colis des États-Unis vers Haïti.
            </p>

            <!-- USA Address Card - HIGHLIGHTED -->
            <div style="background: linear-gradient(135deg, #E63946, #F77F00); padding: 30px; border-radius: 12px; margin: 0 0 30px 0; box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: white; margin: 0 0 10px 0; font-size: 22px;">
                        📍 Votre Adresse USA Personnalisée
                    </h2>
                    <p style="color: white; margin: 0; font-size: 14px; opacity: 0.9;">
                        Utilisez cette adresse pour toutes vos commandes en ligne
                    </p>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 18px; color: #333; font-weight: bold; line-height: 1.8; white-space: pre-line;">
${data.fullUSAAddress}
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: white; margin: 0; font-size: 13px; opacity: 0.9;">
                        💡 Copiez cette adresse et utilisez-la comme adresse de livraison sur Amazon, eBay, etc.
                    </p>
                </div>
            </div>

            <!-- How It Works -->
            <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin: 0 0 30px 0;">
                <h3 style="color: #333; margin: 0 0 25px 0; font-size: 20px; text-align: center;">
                    🚀 Comment ça marche ?
                </h3>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; width: 40px; vertical-align: top;">
                            <div style="width: 35px; height: 35px; background: #E63946; color: white; border-radius: 50%; text-align: center; line-height: 35px; font-weight: bold; font-size: 16px;">
                                1
                            </div>
                        </div>
                        <div style="display: table-cell; vertical-align: top; padding-left: 15px;">
                            <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">
                                Commandez en ligne
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                                Utilisez votre adresse USA personnalisée lors de vos achats sur Amazon, eBay, ou tout autre site américain.
                            </p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; width: 40px; vertical-align: top;">
                            <div style="width: 35px; height: 35px; background: #F77F00; color: white; border-radius: 50%; text-align: center; line-height: 35px; font-weight: bold; font-size: 16px;">
                                2
                            </div>
                        </div>
                        <div style="display: table-cell; vertical-align: top; padding-left: 15px;">
                            <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">
                                Nous recevons votre colis
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                                Votre colis arrive à notre entrepôt de Miami. Vous recevrez un email de confirmation.
                            </p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; width: 40px; vertical-align: top;">
                            <div style="width: 35px; height: 35px; background: #E63946; color: white; border-radius: 50%; text-align: center; line-height: 35px; font-weight: bold; font-size: 16px;">
                                3
                            </div>
                        </div>
                        <div style="display: table-cell; vertical-align: top; padding-left: 15px;">
                            <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">
                                Expédition vers Haïti
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                                Nous expédions votre colis vers Haïti. Suivez son parcours en temps réel depuis votre dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <div style="display: table; width: 100%;">
                        <div style="display: table-cell; width: 40px; vertical-align: top;">
                            <div style="width: 35px; height: 35px; background: #F77F00; color: white; border-radius: 50%; text-align: center; line-height: 35px; font-weight: bold; font-size: 16px;">
                                4
                            </div>
                        </div>
                        <div style="display: table-cell; vertical-align: top; padding-left: 15px;">
                            <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">
                                Récupérez votre colis
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                                Une fois arrivé en Haïti, venez récupérer votre colis à notre entrepôt après paiement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Account Info -->
            <div style="background: #e7f3ff; padding: 25px; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #0d6efd;">
                <h3 style="color: #084298; margin: 0 0 15px 0; font-size: 18px;">
                    📋 Informations de votre compte
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #084298; font-size: 14px; font-weight: 600;">
                            Email
                        </td>
                        <td style="padding: 8px 0; color: #084298; text-align: right; font-size: 14px;">
                            ${data.email}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #084298; font-size: 14px; font-weight: 600;">
                            Code client
                        </td>
                        <td style="padding: 8px 0; color: #084298; text-align: right; font-size: 14px; font-family: monospace;">
                            ${data.customAddress}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${data.dashboardUrl}" 
                   style="background: linear-gradient(135deg, #E63946, #F77F00); 
                          color: white; 
                          padding: 18px 50px; 
                          text-decoration: none; 
                          border-radius: 30px; 
                          font-weight: bold;
                          font-size: 17px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);">
                    🏠 Accéder à mon Dashboard
                </a>
            </div>

            <!-- Tips -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 30px 0 0 0; border-left: 4px solid #ffc107;">
                <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">
                    💡 Conseils pour bien démarrer
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
                    <li>Sauvegardez votre adresse USA dans vos favoris</li>
                    <li>Vérifiez que votre profil est complet (adresse en Haïti)</li>
                    <li>Activez les notifications pour suivre vos colis</li>
                    <li>Contactez-nous pour toute question</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a1a; color: white; padding: 35px 20px; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
                Yeng Shipping
            </p>
            <p style="margin: 0 0 20px 0; font-size: 15px; opacity: 0.9;">
                Expédition USA-Haiti Simplifiée
            </p>
            <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.8;">
                📍 7829 NW 72nd Ave, Miami, FL 33166, USA
            </p>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                📧 support@yengshipping.com
            </p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, html };
}
