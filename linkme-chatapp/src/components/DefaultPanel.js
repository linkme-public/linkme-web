import React, { Component } from 'react';
import ConversationHeader from './ConversationHeader';

/**
 * The router loads this Component when no Conversation
 * is currently the active Conversation, and a New Conversation
 * is not currently being created.
 */
export default class DefaultPanel extends Component {
  render() {
    return (
      <div className='right-panel'>
        <ConversationHeader title='' disableEdit/>
        <div className='message-list'>
          <img className='layer-logo' src='http://static.layer.com/logo-only-black.svg' />
        </div>
      </div>
    );
  }
}
