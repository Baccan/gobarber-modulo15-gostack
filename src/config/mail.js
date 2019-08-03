// protocolos smtp
export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  // certificado ssl?
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // padrão para todos os emails
  default: {
    from: 'Equipe GoBarber <noreply@gobarber.com>',
  },
};

/**
 * Serviçoes de e-mail para a plicação em produção:
 * Amazon SES
 * Mailgun
 * Sparkpost
 * Mandril(Mailchimp)
 */

//  Mailtrap (DEV)
