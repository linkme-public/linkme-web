'use strict';

var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config');
var bodyParser = require('body-parser')
var fs = require('fs')
var jsrsasign = require('jsrsasign');
var request = require('request');
var async = require('async');

var api = require('./routes/api');

var app = createApp();

function createApp() {

  var app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  var port = normalizePort(process.env.PORT || '3000');

  var compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
  app.use(express.static('.'));

  // routes
  app.use("/api", api);

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  var layerProviderID = process.env.LAYER_PROVIDER_ID;
  var layerKeyID = process.env.LAYER_KEY_ID;
  var privateKey = process.env.PRIVATE_KEY;
  var facebookAppId = process.env.FACEBOOK_APPID;
  var appToken = facebookAppId + "|" + process.env.FACEBOOK_APPSECRET;

  if (!privateKey) {
    try {
      privateKey = fs.readFileSync('key.pem').toString();
    } catch (e) {
      console.error('Couldn\'t find Private Key file: key.pem');
      console.log(e);
    }
  }

  app.get('/facebook/app', function (req, res) {
    res.json(facebookAppId);
  });
  
  app.get('/layer/app', function (req, res) {
    res.json(process.env.LAYER_APPID);
  });

  app.post('/authenticate', function (req, res) {
    
    console.log("Started authenticating");
    
    // TODO: verify if Facebook token is valid for that user -> Otherwise anyone with a facebook user id, can send messages on his/her behalf, by seding us a valid nonce
    var userId = req.body.user_id;
    var nonce = req.body.nonce;
    var userToken = req.body.user_token;
    
    console.log("userId = " + userId);
    console.log("nonce = " + nonce);

    if (!userId) return res.status(400).send('Missing `user_id` body parameter.');
    if (!nonce) return res.status(400).send('Missing `nonce` body parameter.');
    if (!userToken) return res.status(400).send('Missing `user_token` body parameter.');

    if (!layerProviderID) return res.status(500).send('Couldn\'t find LAYER_PROVIDER_ID');
    if (!layerKeyID) return res.status(500).send('Couldn\'t find LAYER_KEY_ID');
    if (!privateKey) return res.status(500).send('Couldn\'t find Private Key');
    
    validateFacebookUserToken(req.body.user_id, req.body.user_token, function onValidate(successful) {
      if(!successful) {
        res.send(401, { error: 'Authentication failed' });
        return;
      }
      
      var header = JSON.stringify({
        typ: 'JWT',           // Expresses a MIMEType of application/JWT
        alg: 'RS256',         // Expresses the type of algorithm used to sign the token, must be RS256
        cty: 'layer-eit;v=1', // Express a Content Type of application/layer-eit;v=1
        kid: layerKeyID
      });

      var currentTimeInSeconds = Math.round(new Date() / 1000);
      var expirationTime = currentTimeInSeconds + 10000;

      var claim = JSON.stringify({
        iss: layerProviderID,       // The Layer Provider ID
        prn: userId,                // User Identifier
        iat: currentTimeInSeconds,  // Integer Time of Token Issuance 
        exp: expirationTime,        // Integer Arbitrary time of Token Expiration
        nce: nonce                  // Nonce obtained from the Layer Client SDK
      });

      var jws = null;
      try {
        jws = jsrsasign.jws.JWS.sign('RS256', header, claim, privateKey);
      } catch (e) {
        return res.status(500).send('Could not create signature. Invalid Private Key: ' + e);
      }

      res.json({
        identity_token: jws
      });  
    });    
  });

  app.listen(port, function (error) {
    if (error) {
      console.error(error);
    } else {
      console.info('Webpack devServer started. Open http://localhost:' + port + ' in your browser.');
    }
  });

  /**
   * Normalize a port into a number, string, or false.
   */

  function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }
  
  function validateFacebookUserToken(userId, userToken, onResponse) {
    var requestUri = 'https://graph.facebook.com/debug_token?input_token=' + userToken + '&access_token=' + userToken;
    console.log("validateFacebookUserToken - Facebook Request uri: " + requestUri);
    request(requestUri, function (error, response, body) {
      console.log("validateFacebookUserToken: " + JSON.stringify(response));
      if (error) {
        console.log("Error authenticating with graph.facebook");
        console.log(error);
        throw error;
      }
      console.log("Got back " + response.statusCode + " from graph.facebook");
      if (!error && response.statusCode == 200) {
        var resJson = JSON.parse(response.body);
        return onResponse(resJson.data.app_id == facebookAppId
               && resJson.data.user_id == userId);
      }
    });
  }

  return app;
}

module.exports = app;