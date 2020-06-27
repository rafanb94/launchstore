const nodemailer = require ('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "7fc43216a08aae",
      pass: "232f0158b4ab92"
    }
  })