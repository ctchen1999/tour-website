const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");
const pug = require("pug");

// new Email(user, url).sendWelcome
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `CTCHEN ${process.env.EMAIL_FROM}`;
    }

    newTransport() {
        if (process.env.NODE_ENV === "production") {
            return nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_VALUE, // generated ethereal user
                    pass: process.env.API_PASSWORD // generated ethereal password
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Send actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject: subject
            }
        );

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: convert(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send("welcome", "Welcome to the Natours family!");
    }

    async sendPasswordReset() {
        await this.send(
            "passwordReset",
            "Your password reset token (valid for only 10 minutes)"
        );
    }
};
