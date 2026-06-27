// types/nodemailer.d.ts
declare module 'nodemailer' {
  export interface TransportOptions {
    service?: string;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface SendMailOptions {
    from?: string;
    to: string;
    subject: string;
    html: string;
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<any>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}