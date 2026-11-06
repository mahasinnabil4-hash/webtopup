interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, text, from } = options

  const emailFrom = from || process.env.EMAIL_FROM || 'noreply@nexatopup.com'

  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
    console.log('[DEV] Email would be sent:', { to, subject, from: emailFrom })
    return { success: true }
  }

  try {
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

export function generateOrderEmailHtml(data: {
  orderNumber: string
  gameName: string
  productName: string
  userGameId: string
  userZoneId?: string
  amount: number
  status: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e1b4b, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { color: #64748b; }
        .detail-value { font-weight: 600; color: #1e293b; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; }
        .status-success { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NEXATOPUP</h1>
          <p>Game Top-up Platform</p>
        </div>
        <div class="content">
          <h2>Order Update</h2>
          <p>Hello, your order status has been updated.</p>
          
          <div class="detail-row">
            <span class="detail-label">Order Number</span>
            <span class="detail-value">${data.orderNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Game</span>
            <span class="detail-value">${data.gameName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Product</span>
            <span class="detail-value">${data.productName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">User ID</span>
            <span class="detail-value">${data.userGameId}</span>
          </div>
          ${data.userZoneId ? `
          <div class="detail-row">
            <span class="detail-label">Zone ID</span>
            <span class="detail-value">${data.userZoneId}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">${formatPrice(data.amount)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">
              <span class="status ${getStatusClass(data.status)}">${data.status}</span>
            </span>
          </div>
          
          <div class="footer">
            <p>Thank you for using NEXATOPUP!</p>
            <p>If you have any questions, contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'SUCCESS':
      return 'status-success'
    case 'FAILED':
      return 'status-failed'
    default:
      return 'status-pending'
  }
}