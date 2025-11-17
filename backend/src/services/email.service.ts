import nodemailer from 'nodemailer';

/**
 * Configuração do transporter de email
 * Suporta SMTP padrão ou Gmail
 */
const createTransporter = () => {
  // Se estiver em desenvolvimento e não houver configuração de email, usar console
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return null; // Retornar null para usar console.log em desenvolvimento
  }

  // Configuração para SMTP customizado
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Para desenvolvimento com certificados auto-assinados
      },
    });
  }

  // Configuração para Gmail (se SMTP_USER contém @gmail.com)
  if (process.env.SMTP_USER?.includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Senha de app do Gmail
      },
    });
  }

  return null;
};

/**
 * Envia email de recuperação de senha
 * 
 * @param to - Email do destinatário
 * @param resetToken - Token de recuperação
 * @param userName - Nome do usuário (opcional)
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  userName?: string
): Promise<void> => {
  const transporter = createTransporter();
  
  // URL base do frontend (pode ser configurada via env)
  const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@s3eengenharia.com.br',
    to,
    subject: 'Recuperação de Senha - S3E System PRO',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background: #5568d3;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Recuperação de Senha</h1>
          <p>S3E System PRO</p>
        </div>
        <div class="content">
          <p>Olá${userName ? `, ${userName}` : ''}!</p>
          
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no S3E System PRO.</p>
          
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Redefinir Senha</a>
          </div>
          
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-size: 12px;">
            ${resetLink}
          </p>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este link expira em <strong>1 hora</strong></li>
              <li>Se você não solicitou esta recuperação, ignore este email</li>
              <li>Não compartilhe este link com ninguém</li>
            </ul>
          </div>
          
          <p>Se você não solicitou esta recuperação, pode ignorar este email com segurança.</p>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} S3E Engenharia. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Recuperação de Senha - S3E System PRO
      
      Olá${userName ? `, ${userName}` : ''}!
      
      Recebemos uma solicitação para redefinir a senha da sua conta.
      
      Clique no link abaixo para criar uma nova senha:
      ${resetLink}
      
      Este link expira em 1 hora.
      
      Se você não solicitou esta recuperação, ignore este email.
      
      © ${new Date().getFullYear()} S3E Engenharia.
    `,
  };

  try {
    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email de recuperação enviado para: ${to}`);
    } else {
      // Em desenvolvimento, apenas logar
      console.log('📧 [DEV MODE] Email de recuperação de senha:');
      console.log(`   Para: ${to}`);
      console.log(`   Link: ${resetLink}`);
      console.log(`   Token: ${resetToken.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email de recuperação:', error);
    // Em desenvolvimento, ainda logar mesmo se falhar
    if (!transporter) {
      console.log('📧 [DEV MODE] Email de recuperação de senha:');
      console.log(`   Para: ${to}`);
      console.log(`   Link: ${resetLink}`);
    }
    // Não lançar erro para não expor informações sensíveis
    // O email pode falhar mas o token ainda é válido
  }
};

/**
 * Testa a conexão com o servidor de email
 */
export const testEmailConnection = async (): Promise<boolean> => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('⚠️  Email não configurado - usando modo desenvolvimento (console.log)');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Conexão com servidor de email verificada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar conexão de email:', error);
    return false;
  }
};

