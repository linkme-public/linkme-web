import React, { Component, PropTypes } from 'react';
import { connectTypingIndicator } from 'layer-react';

/**
 * This Component renders a list of names of people
 * who are currently typing in the Conversation.
 */
@connectTypingIndicator()
export default class TypingIndicator extends Component {

  getTypingText(users, typingIds) {
    const userNames = typingIds.join(', ');

    if (typingIds.length == 1) {
      return userNames + ' is typing.'
    } else if (typingIds.length > 1) {
      return userNames + ' are typing.'
    } else {
      return '';
    }
  }

  render() {
    const typingText = this.getTypingText(this.props.users, this.props.typing);

    return (
      <div className='typing-indicator-panel'>{typingText}</div>
    );

  }
}
