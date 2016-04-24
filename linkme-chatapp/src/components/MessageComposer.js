import React, { Component } from 'react';

const ENTER = 13;

export default class MessageComposer extends Component {

  /**
   * Any time the input changes, we'll want to send a typing indicator
   * to other participants; this.props.onChange handles that.
   */
  handleChange = (event) => {
    this.props.onChange(event.target.value);
  }

  /**
   * onEnter, send the message using this.props.onSubmit()
   */
  handleKeyDown = (event) => {
    if (event.keyCode === ENTER && !event.shiftKey) {
      event.preventDefault();
      if (this.props.value.length) {
        this.props.onSubmit();
      }
    }
  }

  render() {
    return (
      <div className='message-composer'>
        <textarea
          className='message-textarea'
          placeholder='Enter a message...'
          rows='1'
          value={this.props.value}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}/>
      </div>
    );
  }
}
