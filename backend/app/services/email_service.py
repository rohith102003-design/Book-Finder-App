import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.core.config import settings

logger = logging.getLogger("bibliotrack.email")


class EmailService:
    """Email delivery service supporting SMTP delivery with development console fallback"""

    def send_verification_email(
        self,
        to_email: str,
        username: str,
        code: str,
    ) -> bool:
        """Sends an activation email containing a 6-digit verification code"""
        subject = f"Verify your {settings.EMAILS_FROM_NAME} Account"
        
        # Plaintext Body
        text_content = f"""Hello @{username},

Welcome to {settings.EMAILS_FROM_NAME}!

Your email verification code is: {code}

Please enter this 6-digit code in the application to activate your account and access your personal library, bookshelf, and reading analytics.

This code will expire in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.

If you did not register for an account, please ignore this email.

Happy Reading,
The {settings.EMAILS_FROM_NAME} Team
"""

        # HTML Body
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
    .card {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
    .brand {{ display: inline-block; font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 20px; }}
    .title {{ font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; }}
    .code-box {{ background: #f1f5f9; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; margin: 24px 0; border: 1px dashed #cbd5e1; }}
    .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">📖 {settings.EMAILS_FROM_NAME}</div>
    <h1 class="title">Verify Your Email Address</h1>
    <p>Hi <strong>@{username}</strong>,</p>
    <p>Thank you for joining {settings.EMAILS_FROM_NAME}. To complete your registration and activate your personal reading dashboard, enter this verification code:</p>
    <div class="code-box">{code}</div>
    <p>This code will expire in <strong>{settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes</strong>.</p>
    <div class="footer">
      If you did not create an account on {settings.EMAILS_FROM_NAME}, you can safely disregard this message.
    </div>
  </div>
</body>
</html>
"""

        # If SMTP is configured, attempt real SMTP delivery
        if settings.SMTP_HOST and settings.SMTP_USER:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
                msg["To"] = to_email

                part1 = MIMEText(text_content, "plain")
                part2 = MIMEText(html_content, "html")
                msg.attach(part1)
                msg.attach(part2)

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    if settings.SMTP_TLS:
                        server.starttls()
                    if settings.SMTP_PASSWORD:
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
                
                logger.info(f"Verification email sent via SMTP to {to_email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP to {to_email}: {e}")

        # Development Fallback: Print cleanly to console
        print("\n" + "=" * 64)
        print(f"[BIBLIOTRACK EMAIL SERVICE] Verification Code Dispatch")
        print(f"   To: {to_email} (@{username})")
        print(f"   Verification Code: [ {code} ]")
        print(f"   Expires in: {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes")
        print("=" * 64 + "\n")
        return True


email_service = EmailService()
