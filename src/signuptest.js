const accountSid = 'AC1f53a8ff570072110bce88fae1704337'; // Your Account SID from www.twilio.com/console
const authToken = '308760c997075743ecc23fb725f6274c'; //

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const { MessagingResponse } = require('twilio').twiml;

const phoneNumber = '6096475415';

client.messages
    .create({
        body: 'Welcome to Andy! We are excited to have you on board.',
        to: '+1' + phoneNumber, // Text this number
        from: '+13049244804', // From a valid Twilio number
    })
    .then((message) => console.log(message.sid));
