import * as VirtualDOM from 'virtual-dom';
import htmlescape from 'htmlescape';
import { State } from './state';
import { User } from './user';

const { h } = VirtualDOM;

const renderUser = (user: User): VirtualDOM.VTree => {
  return h('div.user', [
    h('span.name', [user.name]),
    h('span.bio', [user.bio])
  ]);
};

const renderApp = (state: State) => {
  return h('div#app', [
    renderUser(state.user)
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
      h('script', { src: '/bundle.js' }, [])
    ])
  ]);
};

export { view };