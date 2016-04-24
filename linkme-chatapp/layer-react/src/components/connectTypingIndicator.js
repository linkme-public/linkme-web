/**
 * The createTypingIndicator module creates a Wrapped Component;
 * it takes in a Client (typically via the LayerProvider)
 * and a conversationId (the Conversation the user is currently viewing)
 * and adds `typing` and `paused` properties to the Wrapped Component
 * allowing for the component to render a typing indicator.
 */
import React, { Component, PropTypes } from 'react';

/**
 * Exports a function that takes as input a Component to wrap and returns a new Component.
 * The new Component takes as input a client and conversationId, and adds `typing` and `paused`
 * properties to the component that was passed as input, allowing for the component to render a typing indicator.
 *
 * @method connectTypingIndicator
 * @return {Function}      Call this function to create a wrapped component which can be
 *                         be rendered and which passes typing indicator data to its child.
 */
export default function connectTypingIndicator() {

  /**
   * Takes a Component, and wraps it with a TypingIndicatorContainer (makes the
   * input Component a child Component of the TypingIndicatorContainer) and
   * passes in typing indicator data to the wrapped Component in the form of properties.
   *
   * @method
   * @param  {Component} ComposedComponent   The Component to wrap
   * @return {TypingIndicatorContainer}      A Component that wraps the specified Component
   */
  return (ComposedComponent) => {

    /**
     * The TypingIndicatorContainer listens for typing indicator events from the client that
     * relate to the current conversation, and passes typing and paused properties into its child
     * component.
     *
     * @class TypingIndicatorContainer
     * @extends {react.Component}
     */
    return class TypingIndicatorContainer extends Component {

      static propTypes = {
        client: PropTypes.object,
        conversationId: PropTypes.string,
      }

      // Necessary in order to grab client out of the context.
      // TODO: May want to rename to layerClient to avoid conflicts.
      static contextTypes = {
        client: PropTypes.object,
      }

      constructor(props, context) {
        super(props, context);

        this.client = props.client || context.client;

        this.state = {
          typing: [],
          paused: [],
        };
      }

      componentWillMount() {
        this.client.on('typing-indicator-change', this.onTypingIndicatorChange);
      }

      onTypingIndicatorChange = ({ conversationId, typing, paused }) => {
        if (conversationId === this.props.conversationId) {
          this.setState({
            typing,
            paused,
          });
        }
      }

      componentWillReceiveProps(nextProps) {
        if (this.props.conversationId !== nextProps.conversationId) {
          this.setState({
            typing: [],
            paused: [],
          });
        }
      }

      render() {
        return <ComposedComponent {...this.props} {...this.state} />;
      }

      componentWillUnmount() {
        this.client.off('typing-indicator-change', this.onTypingIndicatorChange);
      }
    };
  };
}
