var router = require("express").Router();
var validUrl = require('valid-url');
var layer = require('layer-api');

var layerProviderID = process.env.LAYER_PROVIDER_ID;
var layerKeyID = process.env.LAYER_KEY_ID;
var privateKey = process.env.PRIVATE_KEY;
var layerAppId = process.env.LAYER_APPID;
var layerAppTokenId = process.env.LAYER_APP_TOKEN;
  
var client = new layer({
    appId: layerAppId,
    token: layerAppTokenId
});

/**
 * Get a ping from the api
 */
router.get('/', function (request, response) {
    response.send({
        message: "Api is running."
    });
});

/**
 * Post a link to the api
 */
router.post('/link', function (request, response) {
    var link = request.body.link;

    console.log("link = " + link);

    if (link === null || link === undefined) {
        response
            .status(400)
            .send({
                message: "Link is null or undefined."
            });

        return;
    }

    if (!validUrl.isUri(link)) {
        response
            .status(400)
            .send({
                message: "You think you can fool me with an invalid URL?"
            });

        return;
    }

    // Create a Conversation 
    client.conversations.create({
            participants: [
            "1173665432652489", //vando
            "10153420634920946", //reza
            "1176465935705725" //olly
        ],
        distinct: false
    }, function(err, res) {
        var cid = res.body.id;
        
        // Send a Message 
        client.messages.sendTextFromUser(cid, '1173665432652489', link, function(err, res) {
            console.log(err || res.body);
        });
    });

    response
        .status(200)
        .end();
});

module.exports = router;