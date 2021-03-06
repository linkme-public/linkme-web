var should = require("should");
var request = require("supertest");
var async = require("async");
var nock = require('nock');

var server = require("./../devServer");

/**
 * Test suite for server
 */
describe("server tests", function () {


    it("should exist", function (done) {

        should.exist(server);
        done();
    });

    it("should warm up server", function (done) {

        this.timeout(20000);

        request(server)
            .get("/")
            .expect(200, done);
    });
});

/**
 * Test suite for api
 */
describe("api tests", function () {

    it("should have /api", function (done) {

        request(server)
            .get("/api")
            .expect(200, done);
    });

    it("should not allow posting to /api/link without link", function (done) {

        request(server)
            .post("/api/link")
            .expect(400, done);
    });

    it("should not allow posting to /api/link with invalid link", function (done) {

        request(server)
            .post("/api/link")
            .field("link", "invalidlink")
            .expect(400, done);
    });

    it("should allow posting to /api/link with a valid link", function (done) {

        function testLink(link) {
            return function (done) {
                request(server)
                    .post("/api/link")
                    .send({ link: link })
                    .expect(200, done);
            };
        }

        async.parallel([
            testLink("http://google.com"),
            testLink("https://google.com"),
            testLink("http://www.google.com"),
            testLink("https://www.google.com")
        ], done);
    });
    
    it("should allow getting facebook app ID", function(done) {
          request(server)
            .get("/facebook/app")
            .expect('"' + process.env.FACEBOOK_APPID + '"', done);
    });
    
    it("should allow getting Layer app ID", function(done) {
          request(server)
            .get("/layer/app")
            .expect('"' + process.env.LAYER_APPID + '"', done);
    });
    
    var userToken = process.env.FACEBOOK_TESTUSER_APPTOKEN;
    var facebookAppId = process.env.FACEBOOK_APPID;
    var appToken = facebookAppId + "%7C" + process.env.FACEBOOK_APPSECRET;
    var facebookTestUserId = "104665883270909";
                
    var couchdb = nock('https://graph.facebook.com')
                .persist()
                .get("/debug_token?input_token=" + userToken + "&access_token=" + appToken)
                .reply(200, {
                    statusCode: 200,
                    data: {
                        app_id: facebookAppId,
                        user_id: facebookTestUserId
                    }
                 });
                 
    it("authenticate should return identity_token given a user_id and nonce", function(done) {
          request(server)
            .post("/authenticate")
            .send({user_id:facebookTestUserId})
            .send({user_token: userToken})
            .send({nonce: "arbitraryString"})    
            .expect(200, done);
    });

    it("authenticate should error 400 if user_id is missing", function(done) {
          request(server)
            .post("/authenticate")
            .send({user_token: userToken})
            .send({nonce: "arbitraryString"})
            .expect(400,'Missing `user_id` body parameter.', done);
    });
    
    it("authenticate should error 400 if nonce is missing", function(done) {
          request(server)
            .post("/authenticate")
            .send({user_id:facebookTestUserId})
            .send({user_token: userToken})
            .expect(400,'Missing `nonce` body parameter.', done);
    });
    
    it("authenticate should error 400 if user_token is missing", function(done) {
          request(server)
            .post("/authenticate")
            .send({user_id:facebookTestUserId})
            .send({nonce: "arbitraryString"})
            .expect(400,'Missing `user_token` body parameter.', done);
    });
});
