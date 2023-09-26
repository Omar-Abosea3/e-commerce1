import nodemailer from "nodemailer";
const sendEmail = async ({from = process.env.EMAIL , to , subject , html , text , attachments = []} = {}) => {
    const transporter = nodemailer.createTransport({
      service:'gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APPPASSWORD,
      },
    });

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
        attachments
    });
}

export default sendEmail ;