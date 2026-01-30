export function getPasswordResetEmailTemplate(data: {
    customerName: string;
    resetToken: string;
    resetUrl: string;
    expiresIn: string;
}): { subject: string; html: string } {
    const subject = `🔒 Réinitialisation de votre mot de passe - Yeng Shipping`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E63946, #F77F00); padding: 40px 20px; text-align: center;">
            <img src="https://www.yengshipping.delivery/logo.png" alt="Yeng Shipping" style="width: 120px; height: auto; margin-bottom: 15px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                🔒 Réinitialisation de mot de passe
            </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff;">
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour <strong>${data.customerName}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 30px 0;">
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Yeng Shipping.
            </p>

            <!-- Warning Box -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                    <strong>⚠️ Important :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel restera inchangé.
                </p>
            </div>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${data.resetUrl}" 
                   style="background: linear-gradient(135deg, #E63946, #F77F00); 
                          color: white; 
                          padding: 18px 50px; 
                          text-decoration: none; 
                          border-radius: 30px; 
                          font-weight: bold;
                          font-size: 17px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);">
                    🔑 Réinitialiser mon mot de passe
                </a>
            </div>

            <!-- Expiration Info -->
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0d6efd;">
                <p style="margin: 0; color: #084298; font-size: 14px; line-height: 1.6;">
                    ⏰ <strong>Ce lien expire dans ${data.expiresIn}</strong>. Après cette période, vous devrez faire une nouvelle demande.
                </p>
            </div>

            <!-- Alternative Link -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                </p>
                <p style="margin: 0; color: #E63946; font-size: 13px; word-break: break-all; font-family: monospace;">
                    ${data.resetUrl}
                </p>
            </div>

            <!-- Security Tips -->
            <div style="background: #d1e7dd; padding: 20px; border-radius: 8px; margin: 30px 0 0 0; border-left: 4px solid #198754;">
                <h4 style="margin: 0 0 10px 0; color: #0a3622; font-size: 16px;">
                    🛡️ Conseils de sécurité
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #0a3622; font-size: 14px; line-height: 1.8;">
                    <li>Choisissez un mot de passe fort (8+ caractères)</li>
                    <li>Utilisez une combinaison de lettres, chiffres et symboles</li>
                    <li>Ne partagez jamais votre mot de passe</li>
                    <li>Changez votre mot de passe régulièrement</li>
                </ul>
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
