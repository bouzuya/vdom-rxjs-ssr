import { h, VTree } from '../framework/view';
import htmlescape from 'htmlescape';
import { State } from './models/state';
import { User } from './models/user';
import renderUser from './views/user';

const renderUsers = (users: User[]): VTree => {
  return h('ul.users', users.map(renderUser).map(user => h('li', [user])));
};

const renderApp = (state: State) => {
  return h('div#app', [
    h('nav', [h('a', { href: '/users' }, ['/users'])]),
    (
      state.user
      ? renderUser(state.user)
      : renderUsers(state.users)
    )
  ]);
};

const view = (state: State, all: boolean = false): VTree => {
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