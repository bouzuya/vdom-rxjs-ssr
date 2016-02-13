import * as VirtualDOM from 'virtual-dom';
import { User } from '../models/user';

const { h } = VirtualDOM;

const renderUser = (user: User): VirtualDOM.VTree => {
  return h('div.user', [
    h('span.name', [
      h('a', { href: '/users/' + user.id }, [user.name])
    ]),
    h('span.bio', [user.bio]),
    h('button.like-button', {
      type: 'button',
      attributes: {
        'data-user-id': user.id.toString()
      }
    }, ['+1']),
    h('span.like', Array.from(new Array(user.likeCount)).map(() => '\u2606'))
  ]);
};

export default renderUser;