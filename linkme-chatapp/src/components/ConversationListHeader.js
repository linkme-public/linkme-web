import React, { Component } from 'react';

/**
 * This Component provides a title over the conversation list
 * and a button for creating a new Conversation.
 */
export default class ConversationListHeader extends Component {
  handleNewConversation = (event) => {
    event.preventDefault();
    this.props.onNewConversation();
  }

  render() {
    return (
      <div className='panel-header conversations-header'>
        <div className='title'>{window.layerSample.user}'s Conversations</div>
        <a href='#' onClick={this.handleNewConversation}>
          <i className="icon fa fa-pencil-square-o"></i>
        </a>
      </div>
    );
  }
}
