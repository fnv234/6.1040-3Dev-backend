import { Router } from 'express';
import sgMail from '@sendgrid/mail';

// Define TypeScript interfaces for errors
interface SendGridError extends Error {
  response?: {
    body?: any;
  };
}

function isSendGridError(error: unknown): error is SendGridError {
  return error instanceof Error;
}

// Define request interface
interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  formLink: string;
}

const router = new Router();

// Set SendGrid API key from environment variables
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is not set');
}
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * POST /email/send
 * Sends an email with a feedback form link
 * 
 * Request body:
 * {
 *   to: string,          // Recipient email address
 *   subject: string,     // Email subject
 *   body: string,        // Email body text
 *   formLink: string     // URL to the feedback form
 * }
 */
router.post('/send', async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: 'Request body is required'
      };
      return;
    }

    const body = ctx.request.body();
    let emailData: EmailRequest;

    if (body.type === 'json') {
      emailData = await body.value;
    } else {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: 'Request body must be JSON'
      };
      return;
    }

    const { to, subject, body: emailBody, formLink } = emailData;
    
    // Validate required fields
    if (!to || !subject || !emailBody || !formLink) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: 'Missing required fields: to, subject, body, or formLink'
      };
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: 'Invalid email format'
      };
      return;
    }

    const msg = {
      to,
      from: Deno.env.get('EMAIL_FROM') || 'threedevteam6104@gmail.com',
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #2c3e50; margin-top: 0;">${subject}</h2>
            <div style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
              ${emailBody.replace(/\n/g, '<br>')}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${formLink}" 
                 style="background: #427AA1; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;
                        font-weight: 500; font-size: 16px;">
                Complete Feedback Form
              </a>
            </div>
            <div style="font-size: 12px; color: #7f8c8d; margin-top: 30px; 
                        border-top: 1px solid #ecf0f1; padding-top: 15px;">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>  ${new Date().getFullYear()} 3Dev. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    
    ctx.response.status = 200;
    ctx.response.body = { 
      success: true,
      message: 'Email sent successfully' 
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    
    console.error('Error sending email:', error);
    
    if (isSendGridError(error) && error.response) {
      console.error('SendGrid error response body:', error.response.body);
    }
    
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: 'Failed to send email',
      details: Deno.env.get('DENO_ENV') === 'development' && error instanceof Error 
        ? error.message 
        : undefined
    };
  }
});

export default router;
