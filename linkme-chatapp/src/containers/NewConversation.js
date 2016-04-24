import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect as connectRedux } from 'react-redux';
import * as MessengerActions from '../actions/messenger';
import ConversationHeader from '../components/ConversationHeader';
import UserList from '../components/UserList';
import MessageComposer from '../components/MessageComposer';

function mapStateToProps({ newConversation }) {
  return { newConversation };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(MessengerActions, dispatch) };
}

@connectRedux(mapStateToProps, mapDispatchToProps)
export default class NewConversation extends Component {
  render() {
    const { newConversation, users, actions } = this.props;
    const {
      changeConversationTitle,
      addParticipant,
      removeParticipant,
      changeComposerMessage,
      submitComposerMessage
    } = actions;
    const { title, participants, composerMessage } = newConversation;
    const composerVisible = participants.length > 0;
    const selectedUsers = participants;

    // Render the ConversationHeader, UserList and MessageComposer
    return (
      <div className='right-panel'>
        <ConversationHeader
          title={title}
          selectedUsers={selectedUsers}
          editingNewConversation={true}
          onChangeConversationTitle={changeConversationTitle}/>

        <UserList
          users={users}
          selectedUsers={selectedUsers}
          onUserSelected={addParticipant}
          onUserUnselected={removeParticipant}/>

        {composerVisible &&
          <MessageComposer
            value={composerMessage}
            onChange={changeComposerMessage}
            onSubmit={submitComposerMessage}/>}
      </div>
    );
  }
}
