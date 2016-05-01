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
      data: JSON.stringify({ "user_id": evt.data.userId, "nonce": nonce }),
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
