import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService {
  private readonly resend: any; // Adjust the type based on the actual type of Resend

  constructor() {
    this.resend = new Resend(process.env.API_KEY_RESEND); // Replace 'YOUR_API_KEY' with your actual API key
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetPasswordUrl =
      'https://e-commerce-frontend-type-script-nextjs-1ql5.vercel.app/reset-password';

    await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Password',
      html: `<p>Please click the following link to reset your password:</p><a href="${resetPasswordUrl}?token=${resetToken}">Reset Password</a>`,
    });
  }
}
