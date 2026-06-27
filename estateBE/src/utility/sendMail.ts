import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({
  to,
  subject,
  html,
}: MailOptions): Promise<void> => {
  // Type-safe environment variable checking
  const emailUser = process.env.MAIL_USER;
  const emailPass = process.env.MAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS environment variables must be set');
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    html,
  });
};

export default sendMail;