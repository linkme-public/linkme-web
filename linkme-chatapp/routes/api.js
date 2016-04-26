var router = require("express").Router();
var validUrl = require('valid-url');

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
            .send("Link is null or undefined.");

        return;
    }

    if (!validUrl.isUri(link)) {
        response
            .status(400)
            .send("You think you can fool me with an invalid URL?");

        return;
    }

    response
        .status(200)
        .end();
});

module.exports = router;