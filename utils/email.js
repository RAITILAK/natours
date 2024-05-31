// const nodemailer = require('nodemailer');
// const pug = require('pug');
// const { convert } = require('html-to-text');
// const Transport = require('nodemailer-brevo-transport');

// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0];
//     this.url = url;
//     this.from = `Tilak Rai <${process.env.EMAIL_FROM}>`;
//   }

//   newTransport() {
//     if (process.env.NODE_ENV === 'production') {
//       // Define production transport options here

//       return nodemailer.createTransport(
//         //SendinBlue now called brevo
//         new Transport({
//           apiKey: `${process.env.SEND_IN_BLUE_API_KEY}`,
//         })
//       );
//     } else {
//       //use development transport
//       return nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD,
//         },
//         secure: false,
//         logger: true,
//         tls: {
//           rejectUnauthorized: true,
//         },
//       });
//     }
//   }

//   async send(template, subject) {
//     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//       firstName: this.firstName,
//       url: this.url,
//       subject,
//     });

//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//       text: convert(html),
//     };

//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     await this.send('welcome', 'Welcome to the Natours Family!');
//   }

//   async sendPasswordReset() {
//     await this.send(
//       'passwordReset',
//       'Your password reset token (valid for only 10 minutes)'
//     );
//   }
// };

const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const Transport = require('nodemailer-brevo-transport');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Tilak Rai <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      console.log('Using Brevo (Sendinblue) transport');
      return nodemailer.createTransport(
        new Transport({
          apiKey: process.env.SEND_IN_BLUE_API_KEY,
        })
      );
    } else {
      console.log('Using Mailtrap transport');
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        secure: false,
        logger: true,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    try {
      await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
