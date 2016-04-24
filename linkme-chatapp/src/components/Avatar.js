import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

export default class Avatar extends Component {

  static propTypes = {
    user: PropTypes.string,
    users: PropTypes.array
  }

  renderUserItem = (user) => {
    return <span key={user}>{user.substr(0, 2).toUpperCase()}</span>;
  }

  render() {
    const { user, users } = this.props;
    let usersToRender = user ? [user] : users.slice(-2);
    let styles = cx({
      avatar: true,
      cluster: usersToRender && usersToRender.length > 1
    });

    return <div className={styles}>{usersToRender.map(this.renderUserItem)}</div>;
  }
}
