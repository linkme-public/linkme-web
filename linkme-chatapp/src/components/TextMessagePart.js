import React, { Component } from 'react';

export default class TextMessagePart extends Component {
  render() {
    if(this.props.messagePart.body.indexOf("http") > -1) {
      return <div className='bubble text'><a target="_blank" href={this.props.messagePart.body}>{this.props.messagePart.body}</a></div>;      
    }
    return <div className='bubble text'>{this.props.messagePart.body}</div>;
  }
}
