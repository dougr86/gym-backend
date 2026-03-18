import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer'; // Import the internal Mail type

@Injectable()
export class MailService {
  private transporter: Mail;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const creator = nodemailer as unknown as {
      createTransport: (options: any) => Mail;
    };
    this.transporter = creator.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendInvitation(email: string, token: string, gymName: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/onboard?token=${token}`;
    const html = `<h1>Welcome!</h1><p>Join <b>${gymName}</b> here: <a href="${url}">Activate Account</a></p>`;
    await this.send(email, `Invitation to join ${gymName}`, html);
  }

  async sendForgotPassword(email: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const html = `<h1>Reset Password</h1><p>Click <a href="${url}">here</a> to reset your password. Valid for 20 mins.</p>`;
    await this.send(email, 'Password Reset Request', html);
  }

  async sendAdminResetPassword(email: string, tempPass: string) {
    const html = `<h1>Password Reset</h1><p>Your new temporary password is: <b>${tempPass}</b></p>`;
    await this.send(email, 'Your New Temporary Password', html);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"Gym Admin" <${this.configService.get('MAIL_USER')}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      // Log error but don't crash the app
      console.error('Email failed to send:', error);
    }
  }
}
