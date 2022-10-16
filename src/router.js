const Router = require('express').Router;

const { registerBind, sendNotification } = require('./notification_handler');
const tokenGenerator = require('./token_generator');
const config = require('./config');

const router = new Router();
const accountSid = 'AC1f53a8ff570072110bce88fae1704337'; // Your Account SID from www.twilio.com/console
const authToken = '308760c997075743ecc23fb725f6274c';

const twilio = require('twilio');
const client = new twilio(accountSid, authToken);

const { MessagingResponse } = require('twilio').twiml;

// Convert keys to camelCase to conform with the twilio-node api definition contract
const camelCase = require('camelcase');
const User = require('./models/user.model');

function camelCaseKeys(hashmap) {
    var newhashmap = {};
    Object.keys(hashmap).forEach(function (key) {
        var newkey = camelCase(key);
        newhashmap[newkey] = hashmap[key];
    });
    return newhashmap;
}

router.get('/token/:id?', (req, res) => {
    const id = req.params.id;
    res.send(tokenGenerator(id));
});

router.post('/token', (req, res) => {
    const id = req.body.id;
    res.send(tokenGenerator(id));
});

router.post('/register', (req, res) => {
    var content = camelCaseKeys(req.body);
    registerBind(content).then((data) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.status(data.status);
        res.send(data.data);
    });
});

router.post('/send-notification', (req, res) => {
    var content = camelCaseKeys(req.body);
    sendNotification(content).then((data) => {
        res.status(data.status);
        res.send(data.data);
    });
});

router.get('/config', (req, res) => {
    res.json(config);
});

// router.post('/sendMessage', function (req, res) {
//   const contnet = req.body.message;
//   const recept = req.body.to;
//   const userId = req.body.userId;
//   const date = new Date();

//   twilio.messages
//   .create({
//     body: contnet,
//     from: number, // this is hardcoded right now
//     to: recept
//   });

//   // const outgoingMessage = new Message({
//   //   sent: true,
//   //   phoneNumber: number,
//   //   patientID: patientID,
//   //   message: contnet,
//   //   sender: 'COACH',
//   //   date: date
//   // });

//   // outgoingMessage.save().then(() => {
//   //   res.status(200).send({
//   //     success: true,
//   //     msg: outgoingMessage
//   //   });
//   // }).catch((err) => console.log(err));
// });

//Create a facebook-messenger binding based on the authentication webhook from Facebook
router.post('/messenger_auth', function (req, res) {
    //Extract the request received from Facebook
    const message = req.body.entry[0].messaging[0];
    console.log(message);
    // Set user identity using their fb messenger user id
    const identity = message.sender.id;
    //Let's create a new facebook-messenger Binding for our user
    const binding = {
        identity: identity,
        BindingType: 'facebook-messenger',
        Address: message.sender.id,
    };
    registerBind(camelCaseKeys(binding)).then((data) => {
        res.status(data.status);
        res.send(data.data);
    });
});

//Verification endpoint for Facebook needed to register a webhook.
router.get('/messenger_auth', function (req, res) {
    console.log(req.query['hub.challenge']);
    res.send(req.query['hub.challenge']);
});

// firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true },
//   address: { type: String, required: true },
//   password: { type: String, required: true },
//   phoneNumber: { type: String, required: true },
//   cardNumber: { type: String, required: true },
//   cardExp: { type: String, required: true },
//   cardCVC: { type: String, required: true },

router.post('/signup', (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName,
        address,
        phoneNumber,
        cardNumber,
        cardExp,
        cardCVC,
    } = req.body;
    const user = new User({
        firstName,
        lastName,
        email,
        address,
        password,
        phoneNumber,
        cardNumber,
        cardExp,
        cardCVC,
    });

    user.save()
        .then(() => {
            res.status(200).send({
                success: true,
                msg: user,
            });
        })
        .catch((err) => console.log(err));

    console.log('phone number: ' + '+1' + phoneNumber);

    client.messages
        .create({
            body: 'Welcome to Andy! We are excited to have you on board.',
            to: '+1' + phoneNumber, // Text this number
            from: '+13049244804', // From a valid Twilio number
        })
        .then((message) => console.log(message.sid));
});

router.post('/sms_reply', function (req, res) {
    // Start our TwiML response.

    const twiml = new MessagingResponse();
    const message = req.body.Body;
    var response = '';

    User.findBy({ phoneNumber: req.body.From.slice(2) })
        .then((user) => {
            if (user) {
                const product_name = '';
                const product_price = 0;
                const userCard = user.cardNumber;
                const userCardType = user.cardType;
                const userCardExp = user.cardExp;
                const userAddress = user.address;
                const lastFour = userCard.slice(-4);

                //if time, add a check to see if the user had just sent a link before checking for 'y' or 'n'
                if (message.toLowerCase() == 'y') {
                    // call API and go through the checkout process for the link
                    // ON SUCCESS:
                    response = twiml.message(
                        'Thank you for confirming your purchase. We have completed the checkout process for you.'
                    );
                    // ON FAILURE:
                    //response = twiml.message('Sorry, we were unable to process your order. Please try again later.')
                } else if (message.toLowerCase() == 'n') {
                    response = twiml.message(
                        'Ok! We will not go through with the purchase.'
                    );
                } else {
                    // parse the url to get product name

                    if (product_name == 'NOT_VALID') {
                        response = twiml.message(
                            'Sorry, the link is not valid. Please try again.'
                        );
                    } else {
                        response = twiml.message(
                            'Are you sure you would like to purchase ' +
                                product_name +
                                ' for price: ' +
                                product_price +
                                ' with card ending in ' +
                                lastFour +
                                ' to address ' +
                                userAddress +
                                ' . Reply Y to confirm or N to cancel.'
                        );
                    }
                }
            } else {
                response = twiml.message(
                    'You are not registered with us. Please register to continue.'
                );
            }
        })
        .catch((err) => console.log(err));

    console.log(`Incoming message from ${req.body.From}: ${req.body.Body}`);
    twiml.message(req.body.Body);
    // Add a text message.

    // Add a picture message.
    //msg.media('https://demo.twilio.com/owl.png');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

module.exports = router;
