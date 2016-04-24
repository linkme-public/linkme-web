import { Component, PropTypes, Children } from 'react';

/**
 * This class uses React's childContexts to propagate the client property to all
 * subcomponents within this component's subtree.  Subcomponents access
 * the client property via `this.context.client`.
 *
 * This component expects only a single subcomponent, which in turn can have many subcomponents.
 */
export default class LayerProvider extends Component {

  static childContextTypes = {
    client: PropTypes.object.isRequired,
  }

  static propTypes = {
    client: PropTypes.object.isRequired,
    children: PropTypes.element,
  }

  getChildContext() {
    return { client: this.client };
  }

  constructor(props, context) {
    super(props, context);
    this.client = props.client;
  }

  render() {
    let { children } = this.props;

    if (typeof children === 'function') {
      children = children();
    }

    return Children.only(children);
  }
}
