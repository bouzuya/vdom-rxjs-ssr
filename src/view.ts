import * as VirtualDOM from 'virtual-dom';
import htmlescape from 'htmlescape';
import { State } from './models/state';
import { User } from './models/user';

const { h } = VirtualDOM;

const renderUsers = (users: User[]): VirtualDOM.VTree => {
  return h('ul.users', users.map(renderUser).map(user => h('li', [user])));
};

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

const renderApp = (state: State) => {
  return h('div#app', [
    h('nav', [h('a', { href: '/users/' }, ['/users'])]),
    (
      state.user
      ? renderUser(state.user)
      : renderUsers(state.users)
    )
  ]);
};

const view = (state: State, all: boolean = false): VirtualDOM.VTree => {
  const app = renderApp(state);
  if (!all) return app;
  return h('html', [
    h('head', [
      h('title', ['virtual-dom ssr']),
      h('script', ['var INITIAL_STATE = ' + htmlescape(state) + ';'])
    ]),
    h('body', [
      app,
      h('script', { src: '/scripts/bundle.js' }, [])
    ])
  ]);
};

export { view };