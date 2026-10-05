import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

interface InterestedProduct {
  id?: string
  name: string
  category?: string
  price?: number
  sku?: string | null
  imageUrl?: string
}

interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  interestedProduct?: InterestedProduct | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration for xneelo hosting and local dev
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  // Handle preflight browser check
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST requests are supported.' })
  }

  const { name, email, phone, subject, message, interestedProduct } = (req.body || {}) as Partial<ContactPayload>

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(422).json({
      error: 'Please fill in all required fields (name, email, subject, message).',
    })
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(422).json({ error: 'Please enter a valid email address.' })
  }

  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.lumarofurniture.co.za'
    const smtpPort = Number(process.env.SMTP_PORT || 465)
    const smtpUser = process.env.SMTP_USER || 'enquiries@lumarofurniture.co.za'
    const smtpPass = process.env.SMTP_PASS || 'LumaroFurniture@123#'
    const studioRecipient = process.env.CONTACT_RECIPIENT || 'enquiries@lumarofurniture.co.za'
    const ccRecipient = process.env.CC_EMAIL || undefined

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // 1. Send Internal Studio Notification Email
    const studioMailPromise = transporter.sendMail({
      from: `"Lumaro Furniture Studio Website" <${smtpUser}>`,
      to: studioRecipient,
      cc: ccRecipient,
      replyTo: `"${name}" <${email}>`,
      subject: `[Website Lead] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 32px 12px; background-color: #f5f5f4; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #d6d3d1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(28, 25, 23, 0.08);">
            
            <!-- Royal Header Gradient -->
            <div style="background: linear-gradient(135deg, #1c1917 0%, #44403c 50%, #57534e 100%); color: #ffffff; padding: 30px 28px; text-align: center; border-bottom: 2px solid #b45309;">
              <img 
                src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/lumora/LUMORA-LOGO-removebg-preview.png" 
                alt="Lumaro Logo" 
                style="height: 48px; width: auto; margin: 0 auto 10px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"
              />
              <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;">
                New Customer Lead
              </h2>
              <p style="margin: 4px 0 0; font-size: 11px; color: #d6d3d1; letter-spacing: 0.08em; text-transform: uppercase;">
                Lumaro Furniture Studio Website
              </p>
            </div>

            <div style="padding: 28px 24px;">
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;">Customer Name</span>
                <span style="font-size: 15px; color: #1c1917; font-weight: 700;">${name}</span>
              </div>
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;">Email Address</span>
                <a href="mailto:${email}" style="font-size: 15px; color: #b45309; text-decoration: none; font-weight: 600;">${email}</a>
              </div>
              ${phone ? `
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;">Phone Number</span>
                <span style="font-size: 15px; color: #1c1917; font-weight: 600;">${phone}</span>
              </div>
              ` : ''}

              ${interestedProduct ? `
              <div style="margin: 20px 0; padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #fafaf9 100%); border: 1px solid #d6d3d1; border-radius: 12px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #b45309; letter-spacing: 0.08em; margin-bottom: 10px;">
                  Attached Furniture Piece of Interest
                </span>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    ${interestedProduct.imageUrl ? `
                    <td style="width: 72px; vertical-align: top; padding-right: 14px;">
                      <img src="${interestedProduct.imageUrl}" alt="${interestedProduct.name}" style="width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid #d6d3d1; display: block;" />
                    </td>
                    ` : ''}
                    <td style="vertical-align: middle;">
                      <div style="font-size: 15px; font-weight: 700; color: #1c1917;">${interestedProduct.name}</div>
                      ${interestedProduct.category ? `<div style="font-size: 12px; color: #78716c; margin-top: 2px;">Category: ${interestedProduct.category}</div>` : ''}
                      ${interestedProduct.sku ? `<div style="font-size: 11px; color: #a8a29e; font-family: monospace; margin-top: 2px;">SKU: ${interestedProduct.sku}</div>` : ''}
                    </td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 4px;">Subject</span>
                <span style="font-size: 15px; color: #1c1917; font-weight: 700;">${subject}</span>
              </div>
              <div style="margin-bottom: 16px;">
                <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.06em; margin-bottom: 6px;">Message</span>
                <div style="background-color: #f5f5f4; border-left: 4px solid #78716c; border-radius: 6px; padding: 14px 16px; font-size: 13px; color: #44403c; line-height: 1.6; white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            <div style="padding: 14px 24px; background-color: #f5f5f4; font-size: 11px; color: #78716c; border-top: 1px solid #d6d3d1; text-align: center;">
              Replying to this email will reply directly to <strong>${email}</strong>.
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // 2. Automated Customer Welcome & Confirmation Email (Strict style.css design)
    const customerWelcomePromise = transporter.sendMail({
      from: `"Lumaro Furniture Studio" <${smtpUser}>`,
      to: email,
      replyTo: `"Lumaro Furniture Studio" <${smtpUser}>`,
      subject: `Thank you for reaching out, ${name} — Lumaro Furniture Studio`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lumaro Furniture Studio</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Great+Vibes&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 36px 12px; background-color: #f5f5f4; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; color: #1c1917;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #fafaf9 100%); border: 1px solid #d6d3d1; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(28, 25, 23, 0.08);">
            
            <!-- Royal Header Gradient (strict style.css: #1c1917 -> #44403c -> #57534e) -->
            <div style="background: linear-gradient(135deg, #1c1917 0%, #44403c 50%, #57534e 100%); color: #ffffff; padding: 36px 28px; text-align: center; border-bottom: 2px solid #b45309;">
              <img 
                src="https://vydleiyxfqrhxoddbcpi.supabase.co/storage/v1/object/public/lumora/LUMORA-LOGO-removebg-preview.png" 
                alt="Lumaro Logo" 
                style="height: 52px; width: auto; margin: 0 auto 12px; display: block; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));"
              />
              <h1 style="margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #ffffff; line-height: 1.3;">
                Lumaro Furniture Studio
              </h1>
              <p style="margin: 6px 0 0; font-family: 'Great Vibes', 'Alex Brush', cursive, serif; font-size: 19px; color: #d6d3d1; letter-spacing: 0.04em;">
                Handcrafted Hardwood &amp; Architectural Furniture
              </p>
            </div>

            <!-- Body Content -->
            <div style="padding: 34px 28px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #1c1917; margin: 0 0 16px; letter-spacing: -0.01em;">
                Dear ${name},
              </h2>
              
              <p style="font-size: 14px; color: #44403c; line-height: 1.7; margin: 0 0 14px;">
                Thank you for connecting with <strong style="color: #1c1917;">Lumaro Furniture Studio</strong>! We are thrilled to receive your message.
              </p>

              <p style="font-size: 14px; color: #44403c; line-height: 1.7; margin: 0 0 24px;">
                Our artisan studio team is currently reviewing your details. We respond to all inquiries within <strong style="color: #1c1917; background-color: #f5f5f4; padding: 2px 6px; border-radius: 4px; border: 1px solid #e7e5e4;">24 business hours</strong> with answers to your questions, timber recommendations, and delivery details.
              </p>

              ${interestedProduct ? `
              <!-- Selected Product Card (style.css royal-gradient-card) -->
              <div style="margin: 0 0 24px; padding: 18px; background: linear-gradient(135deg, #ffffff 0%, #fafaf9 100%); border: 1px solid #d6d3d1; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                <div style="margin-bottom: 12px;">
                  <span style="display: inline-block; background-color: #f5f5f4; color: #b45309; border: 1px solid #fed7aa; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 6px;">
                    Selected Furniture Piece of Interest
                  </span>
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    ${interestedProduct.imageUrl ? `
                    <td style="width: 76px; vertical-align: top; padding-right: 14px;">
                      <img src="${interestedProduct.imageUrl}" alt="${interestedProduct.name}" style="width: 76px; height: 76px; object-fit: cover; border-radius: 8px; border: 1px solid #d6d3d1; display: block;" />
                    </td>
                    ` : ''}
                    <td style="vertical-align: middle;">
                      <div style="font-size: 15px; font-weight: 700; color: #1c1917; line-height: 1.3;">${interestedProduct.name}</div>
                      ${interestedProduct.category ? `<div style="font-size: 12px; color: #78716c; font-weight: 600; margin-top: 3px;">Category: ${interestedProduct.category}</div>` : ''}
                      ${interestedProduct.sku ? `<div style="font-size: 11px; color: #a8a29e; font-family: monospace; margin-top: 2px;">SKU: ${interestedProduct.sku}</div>` : ''}
                    </td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Summary of Your Message Section -->
              <div style="margin: 0 0 24px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #78716c; letter-spacing: 0.08em; margin-bottom: 8px;">
                  Summary of Your Message
                </div>
                <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; border-left: 4px solid #78716c; border-radius: 8px; padding: 16px 18px;">
                  <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1c1917;">
                    Subject: <span style="font-weight: 600; color: #44403c;">${subject}</span>
                  </p>
                  <div style="font-size: 13px; color: #44403c; line-height: 1.65; white-space: pre-wrap;">${message}</div>
                </div>
              </div>

              <!-- Studio Operating Hours & Info Box -->
              <div style="background: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px 20px; margin: 0 0 24px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    <td style="padding-bottom: 8px; font-size: 12px; color: #44403c; line-height: 1.5;">
                      <strong style="color: #1c1917;">Studio Operating Hours:</strong><br />
                      Monday – Friday: 08:00 – 17:00 &nbsp;|&nbsp; Saturday: 09:00 – 13:00
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; font-size: 12px; color: #44403c; line-height: 1.5;">
                      <strong style="color: #1c1917;">Direct Studio Mailbox:</strong><br />
                      <a href="mailto:enquiries@lumarofurniture.co.za" style="color: #b45309; text-decoration: none; font-weight: 600;">enquiries@lumarofurniture.co.za</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #78716c; line-height: 1.5;">
                      <strong style="color: #1c1917;">Nationwide Logistics:</strong><br />
                      Blanket-wrapped white-glove delivery across all 9 provinces in South Africa.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 13px; color: #78716c; line-height: 1.6; margin: 0 0 24px;">
                If you have additional dimensions, room photos, or architectural sketches, you can simply reply directly to this email.
              </p>

              <!-- Sign-off with Handcrafted Cursive Accent -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e7e5e4;">
                <p style="margin: 0; font-family: 'Great Vibes', 'Alex Brush', cursive, serif; font-size: 26px; color: #78716c; line-height: 1.2;">
                  Warmest regards,
                </p>
                <p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #1c1917; letter-spacing: 0.02em;">
                  The Lumaro Furniture Studio Team
                </p>
              </div>
            </div>

            <!-- Footer (style.css royal-ice background & royal-light text) -->
            <div style="background-color: #f5f5f4; border-top: 1px solid #d6d3d1; padding: 18px 24px; text-align: center; font-size: 11px; color: #a8a29e; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
              &copy; Lumaro Furniture Studio &bull; Handcrafted in South Africa
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Execute both in parallel
    const [studioInfo] = await Promise.all([studioMailPromise, customerWelcomePromise])

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been received. We have sent a confirmation email to your inbox.',
      id: studioInfo.messageId,
    })
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('SMTP Delivery Error:', errorMsg)
    return res.status(500).json({
      error: 'Failed to deliver message via SMTP. Please try again or email us directly at enquiries@lumarofurniture.co.za.',
      details: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
    })
  }
}
