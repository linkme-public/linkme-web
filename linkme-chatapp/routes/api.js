var router = require("express").Router();
var validUrl = require('valid-url');
var layer = require('layer-api');
var requestApi = require('request');

var layerAppId = process.env.LAYER_APPID;
var layerAppTokenId = process.env.LAYER_APP_TOKEN;

var client = new layer({
    appId: layerAppId,
    token: layerAppTokenId
});

function getUserInfo(accessToken, callback) {
    // Get user info
    var userName = "Default User";
    var userInfoUrl = "https://graph.facebook.com/v2.5/me?access_token=" + accessToken + "&method=get&pretty=0&sdk=joey";
    console.log("Getting user info from " + userInfoUrl);
    requestApi(userInfoUrl, function (error, response, body) {
        console.log("Got back user info");

        if (response != undefined && response.body != undefined) {
            var resJson = JSON.parse(response.body);

            console.log(resJson);

            userName = resJson.name;
        }

        callback(userName);
    });
}

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
    var accessToken = request.body.facebookAccessToken;

    console.log("link = " + link);
    console.log("accessToken = " + accessToken);

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

    if (accessToken === undefined) {
        // TODO enforce this check!
        console.log("accessToken is undefined!");
    }

    getUserInfo(accessToken, function (userName) {

        // Create a Conversation 
        client.conversations.create({
            participants: [
                "1173665432652489", //vando
                "10153420634920946", //reza
                "1176465935705725", //olly
                userName
            ],
            distinct: false,
            metadata: {
                "title": link
            }
        }, function (err, res) {
            var cid = res.body.id;

            // Send a Message 
            console.log("Facebook user name = " + userName);
            client.messages.sendTextFromUser(cid, userName, link, function (err, res) {
                console.log(err || res.body);
            });
        });

        response
            .status(200)
            .end();
    });
});

module.exports = router;