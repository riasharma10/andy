const accountSid = 'AC1f53a8ff570072110bce88fae1704337'; // Your Account SID from www.twilio.com/console
const authToken = 'cf0bb2dd4d4b7d3a7ed08bd1fc790352'; // Your Auth Token from www.twilio.com/console

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);
const {MessagingResponse} = require('twilio').twiml; 


client.messages
  .create({
    body: 'Hello from Node',
    to: '+13313330169', // Text this number
    from: '+13049244804', // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));

  // app.post('/sms', (req, res) => {

  //   // Start our TwiML response.
  //   const twiml = new MessagingResponse();
  
  //   // Add a text message.
  //   const msg = twiml.message('Check out this sweet owl!');
  
  //   // Add a picture message.
  //   msg.media('https://demo.twilio.com/owl.png');
  
  //   res.writeHead(200, {'Content-Type': 'text/xml'});
  //   res.end(twiml.toString());
  // });
  


