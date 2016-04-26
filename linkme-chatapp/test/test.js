var should = require("should");
var request = require("supertest");

var server = require("./../devServer");

/**
 * Test suite for server
 */
describe("server tests", function () {

    it("should exist", function (done) {

        should.exist(server);
        done();
    });

});

/**
 * Test suite for api
 */
describe("api tests", function () {

    this.timeout(10000);

    it("should have /api", function (done) {

        request(server)
            .get("/api")
            .expect(200, done);
    });

});
