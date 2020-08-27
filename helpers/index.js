
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config()



exports.sendEmail = emailData => {
    var options = {
        auth: {
            api_key: process.env.SENDGRID_API_KEY
        }
    };

    var client = nodemailer.createTransport(sgTransport(options));

    client.sendMail(emailData, function(err, info){
        console.log(emailData);
        if (err ){
            console.log(err);
        }
        else {
            console.log('Message sent');

        }
    });



};