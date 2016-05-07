import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Client } from 'layer-sdk';
import { LayerProvider } from 'layer-react';
import Messenger from './containers/Messenger';
import NewConversation from './containers/NewConversation';
import ActiveConversation from './containers/ActiveConversation';
import DefaultPanel from './components/DefaultPanel';
import configureStore from './store/configureStore';
import { fetchUsersSuccess } from './actions/messenger';
import { IndexRoute, Route } from 'react-router';
import { ReduxRouter } from 'redux-router';

  window.layerSample = {
    appId: null,
    challenge: function(nonce, callback) {
      layer.xhr({
        url: 'https://layer-identity-provider.herokuapp.com/identity_tokens',
        headers: {
          'X_LAYER_APP_ID': window.layerSample.appId,
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        data: {
          nonce: nonce,
          app_id: window.layerSample.appId,
          user_id: window.layerSample.user
        }
      }, function(res) {
        if (res.success) {
          console.log('challenge: ok');

          callback(res.data.identity_token);

          // Cleanup identity dialog
          var node = document.getElementById('identity');
          node.parentNode.removeChild(node);
        } else {
          console.error('challenge error: ', res.data);
        }
      });
    }
  };

/**
 * Wait for identity dialog message to complete
 */
window.addEventListener('message', function(evt) {
  if (evt.data.layer != 'identity') return;

  //window.postMessage('layer:identity', '*');

  /**
   * Initialize Layer Client with `appId`
   */
  const client = new Client({
    appId: evt.data.layerAppId
  });
  
  window.layerSample.appId = evt.data.layerAppId; 
  window.layerSample.dateFormat = function(date) {
      var now = new Date();
      if (!date) return now.toLocaleDateString();

      if (date.toLocaleDateString() === now.toLocaleDateString()) return date.toLocaleTimeString();
      else return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

  /**
   * Client authentication challenge.
   * Sign in to Layer sample identity provider service.
   *
   * See http://static.layer.com/sdk/docs/#!/api/layer.Client-event-challenge
   */
  console.log("user: " + JSON.stringify(evt.data));
  var getIdentityToken = function(nonce, callback) {
    // Submit form via jQuery/AJAX
    $.ajax({
      type: 'POST',
      url: '/authenticate',
      data: JSON.stringify({ "user_id": evt.data.userId, "nonce": nonce, "user_token":evt.data.fbAccessToken }),
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    })
    .done(function(data) {
      callback(data.identity_token);
    })
    .fail(function(jqXhr) {
      console.log('failed to authenticate');
    }); 
  }
   
  
  
  client.once('challenge', evt => {
    // Provide your own getIdentityToken to get the token from your server
    getIdentityToken(evt.nonce, function(identityToken) {
      // Use the evt.callback method to provide your token back to the client
      console.log("calling the event callback - identityToken: " + identityToken)
      evt.callback(identityToken);
    });
  });

  /**
   * Share the client with the middleware layer
   */
  const store = configureStore(client);

  /**
   * Bootstrap users
   */
  store.dispatch(fetchUsersSuccess([evt.data.userName]));

  // Render the UI wrapped in a LayerProvider
  render(
    <LayerProvider client={client}>
      <Provider store={store}>
        <ReduxRouter>
          <Route path='/' component={Messenger}>
            <IndexRoute component={DefaultPanel}/>
            <Route path='/new' component={NewConversation}/>
            <Route path='/conversations/:conversationId' component={ActiveConversation}/>
          </Route>
        </ReduxRouter>
      </Provider>
    </LayerProvider>,
    document.getElementById('root')
  );
});
