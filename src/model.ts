import { EventEmitter } from 'events';
import { State, Updater } from './models/state';
import { makeRouter, Router } from './router';
import { view } from './view';
import clickLikeAction from './actions/click-like-action';
import listUserAction from './actions/list-user-action';
import showUserAction from './actions/show-user-action';
import changeNameAction from './actions/change-name-action';

type ListenerProxy = (...args: any[]) => void;

type ClientResponse = {
  on: (eventName: string, options?: any) => void;
  rootSelector: string;
  events: [string, string, ListenerProxy][];
  router: Router<void>;
};

type ServerResponse = {
  render: (path: string) => Promise<VirtualDOM.VTree>;
};

const initEvents = (initialState: State): EventEmitter => {
  const events = new EventEmitter();
  const promisedState = State.promised(initialState);
  setInterval(() => events.emit('change-name'), 1000);
  events.on('click-anchor', (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    const path = (<any> event.target).getAttribute('href');
    events.emit('go', path);
  });
  events.on('click-like', (event: Event) => {
    const userId = (<any> event.target).dataset.userId;
    events.emit('update', clickLikeAction(userId));
  });
  events.on('change-name', () => {
    events.emit('update', changeNameAction());
  });
  // events.on('go', ...); // set up by HistoryRouter in client-side.
  events.on('list-users', () => {
    events.emit('update', listUserAction());
  });
  events.on('show-user', ([id]: string[]) => {
    events.emit('update', showUserAction(id));
  });
  events.on('update', (updater: Updater): void => {
    promisedState
      .update(updater)
      .then(state => view(state, false))
      .then(vtree => {
        events.emit('vtree-updated', vtree);
      });
  });
  return events;
};

const client = (state?: any): ClientResponse => {
  const emitter = initEvents(state);
  const emit = emitter.emit.bind(emitter);
  const on = emitter.on.bind(emitter);
  const makeListenerProxy = (eventName: string): ListenerProxy => {
    return (...args: any[]): void => {
      emit.apply(null, [eventName].concat(args));
    };
  };
  const rootSelector = 'div#app';
  const events: [string, string, ListenerProxy][] = [
    ['a', 'click', makeListenerProxy('click-anchor')],
    ['button', 'click', makeListenerProxy('click-like')]
  ];
  const router = makeRouter<void>(
    (routeName: string) => makeListenerProxy(routeName)
  );
  return { events, on, rootSelector, router };
};

const routeActions: { [routeName: string]: (params: string[]) => Updater } = {
  'list-users': (_: string[]) => listUserAction(),
  'show-user': ([id]: string[]) => showUserAction(id)
};

const server = (): ServerResponse => {
  const router = makeRouter<Updater>(
    (routeName: string) => routeActions[routeName]
  );
  const render = (path: string) => {
    const initialState: State = { users: [], user: null };
    return Promise
      .resolve(initialState)
      .then(router.route(path))
      .then(state => view(state, true));
  };
  return { render };
};

export { client, server };