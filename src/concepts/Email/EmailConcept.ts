import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "Email" + ".";

// --- Type Definitions ---
type EmailID = ID;

interface EmailDoc {
  _id: EmailID;
  to: string;
  subject: string;
  body: string;
  formLink?: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  error?: string;
  createdAt: string;
}

/**
 * Email concept for managing email notifications
 * Note: This is a simplified version. In production, you'd integrate with
 * a service like SendGrid, AWS SES, or similar.
 */
export default class EmailConcept {
  private readonly emails: Collection<EmailDoc>;

  constructor(private readonly db: Db) {
    this.emails = this.db.collection(PREFIX + "emails");
  }

  /**
   * queueEmail (to: String, subject: String, body: String, formLink?: String): (email: Email)
   * **requires** to is a valid email address
   * **effects** creates a new email in "pending" status
   */
  async queueEmail({
    to,
    subject,
    body,
    formLink,
  }: {
    to: string;
    subject: string;
    body: string;
    formLink?: string;
  }): Promise<{ email: EmailID }> {
    if (!to || !this.isValidEmail(to)) {
      throw new Error("Invalid email address");
    }

    if (!subject || subject.trim() === "") {
      throw new Error("Subject cannot be empty");
    }

    if (!body || body.trim() === "") {
      throw new Error("Body cannot be empty");
    }

    const emailId = freshID() as EmailID;
    const emailDoc: EmailDoc = {
      _id: emailId,
      to,
      subject,
      body,
      formLink,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await this.emails.insertOne(emailDoc);
    return { email: emailId };
  }

  /**
   * sendEmail (email: Email): ()
   * **requires** email exists and is in "pending" status
   * **effects** attempts to send the email and updates status to "sent" or "failed"
   */
  async sendEmail({
    email,
  }: {
    email: EmailID;
  }): Promise<{ success: boolean }> {
    const emailDoc = await this.emails.findOne({ _id: email });
    if (!emailDoc) {
      throw new Error("Email not found");
    }

    if (emailDoc.status !== "pending") {
      throw new Error("Email has already been processed");
    }

    try {
      // In production, integrate with your email service here
      // For now, we'll simulate sending
      await this.simulateSendEmail(emailDoc);

      await this.emails.updateOne(
        { _id: email },
        {
          $set: {
            status: "sent",
            sentAt: new Date().toISOString(),
          },
        }
      );

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      await this.emails.updateOne(
        { _id: email },
        {
          $set: {
            status: "failed",
            error: errorMessage,
          },
        }
      );

      return { success: false };
    }
  }

  /**
   * Sends an email using SendGrid
   */
  private async simulateSendEmail(emailDoc: EmailDoc): Promise<void> {
    const apiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@yourcompany.com';
    
    if (!apiKey) {
      console.error("❌ SENDGRID_API_KEY not found in environment variables");
      throw new Error("SendGrid API key not configured");
    }

    // Build email body with form link if provided
    let emailBody = emailDoc.body;
    if (emailDoc.formLink) {
      emailBody += `\n\nClick here to access the form: ${emailDoc.formLink}`;
    }

    console.log("📧 Sending email via SendGrid:");
    console.log(`  To: ${emailDoc.to}`);
    console.log(`  Subject: ${emailDoc.subject}`);

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: emailDoc.to }],
              subject: emailDoc.subject
            }
          ],
          from: { email: fromEmail },
          content: [
            {
              type: 'text/plain',
              value: emailBody
            },
            {
              type: 'text/html',
              value: this.generateHtmlEmail(emailDoc)
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ SendGrid API error:", response.status, errorText);
        throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
      }

      console.log("✅ Email sent successfully via SendGrid");
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      throw error;
    }
  }

  /**
   * Generates HTML email template
   */
  private generateHtmlEmail(emailDoc: EmailDoc): string {
    const htmlBody = emailDoc.body.replace(/\n/g, '<br>');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailDoc.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #427AA1;
      margin: 0;
    }
    .content {
      background-color: white;
      border-radius: 6px;
      padding: 25px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #427AA1, #7EA2AA);
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>360° Feedback System</h1>
    </div>
    <div class="content">
      <p>${htmlBody}</p>
      ${emailDoc.formLink ? `
      <div style="text-align: center;">
        <a href="${emailDoc.formLink}" class="button">Access Feedback Form</a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy this link: <a href="${emailDoc.formLink}">${emailDoc.formLink}</a>
      </p>
      ` : ''}
    </div>
    <div class="footer">
      <p>This is an automated message from the 360° Feedback System.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * getEmail (email: EmailID): (emailData: EmailDoc)
   * **requires** email exists
   * **effects** returns the email data
   */
  async getEmail({
    email,
  }: {
    email: EmailID;
  }): Promise<{ emailData: EmailDoc }> {
    const emailDoc = await this.emails.findOne({ _id: email });
    if (!emailDoc) {
      throw new Error("Email not found");
    }

    return { emailData: emailDoc };
  }

  /**
   * getPendingEmails (): (emails: EmailDoc[])
   * **effects** returns all emails in "pending" status
   */
  async getPendingEmails(): Promise<{ emails: EmailDoc[] }> {
    const emails = await this.emails.find({ status: "pending" }).toArray();
    return { emails };
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}