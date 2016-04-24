import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { QueryBuilder } from 'layer-sdk';
import { connectQuery } from 'layer-react';
import * as MessengerActions from '../actions/messenger';
import ConversationList from '../components/ConversationList';
import ConversationListHeader from '../components/ConversationListHeader';

function mapStateToProps({ app, router }) {
  return {
    app,
    activeConversationId: `layer:///conversations/${router.params.conversationId}`
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(MessengerActions, dispatch) };
}

function getQueries() {
  return {
    conversations: QueryBuilder.conversations()
  };
}

/**
 * connectQuery adds a conversations property containing
 * all conversations returned by the Conversation Query.
 */
@connect(mapStateToProps, mapDispatchToProps)
@connectQuery({}, getQueries)
export default class Messenger extends Component {
  renderMessenger() {
    const { app, activeConversationId, actions, conversations } = this.props;
    const { users } = app;
    const { newConversation, deleteConversation } = actions;

    // Render the left-panel which contains the Conversation List
    // and the right-panel which consists of the child components
    // (currently IndexRoute, Route with NewConversation and Route with ActiveConversation)
    return (
      <div className='messenger'>
        <div className='left-panel'>
          <ConversationListHeader
            onNewConversation={newConversation}/>
          <ConversationList
            conversations={conversations}
            users={users}
            activeConversationId={activeConversationId}
            onDeleteConversation={deleteConversation}/>
        </div>
        {this.props.children && React.cloneElement(this.props.children, {
          conversations,
          users
        })}
      </div>
    );
  }

  renderEmptyScreen() {
    return (
      <div className='messenger'></div>
    );
  }

  /**
   * If we are ready, render the Messenger, else render a blank screen
   */
  render() {
    if (this.props.app.ready) {
      return this.renderMessenger();
    } else {
      return this.renderEmptyScreen();
    }
  }
}
