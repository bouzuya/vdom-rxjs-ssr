import { h, VTree } from '../../framework/view';
import { User } from '../models/user';

const renderUser = (user: User): VTree => {
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