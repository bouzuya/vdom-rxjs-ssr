import { EventEmitter } from 'events';
import { State } from './models/state';
import { User } from './models/user';
import { Router } from './libs/router';
import { view } from './view';
import { PromisedState, PromisedStateUpdater } from 'promised-state';

type Updater<T> = PromisedStateUpdater<T>;

// Resource

// dummy storage
const users: User[] = [
  { id: 0, name: 'user1', bio: 'Hello!', likeCount: 2 },
  { id: 1, name: 'user2', bio: 'Hi!', likeCount: 1 },
  { id: 2, name: 'user3', bio: '!olleH', likeCount: 0 }
];

const fetchUsers = (): Promise<User[]> => {
  return Promise.resolve(users);
};

const fetchUser = (id: number): Promise<User> => {
  return Promise.resolve(users[id]);
};

// Updater

const clickLikeAction = (id: string): Updater<State> => {
  return (state: State): Promise<State> => {
    const userId = parseInt(id, 10);
    const newUsers = state.users.map(user => {
      if (user.id !== userId) return user;
      return Object.assign({}, user, { likeCount: user.likeCount + 1 });
    });
    return Promise.resolve(Object.assign({}, state, { users: newUsers }));
  };
};

const listUserAction = (): Updater<State> => {
  return (state: State): Promise<State> => {
    return fetchUsers()
      .then(user => Object.assign({}, state, ({ users, user: null })));
  };
};

const showUserAction = (id: string): Updater<State> => {
  return (state: State): Promise<State> => {
    const userId = parseInt(id, 10);
    return fetchUser(userId)
      .then(user => Object.assign({}, state, ({ users: [], user })));
  };
};

const changeNameAction = (): Updater<State> => {
  return (state: State): Promise<State> => {
    const { user } = state;
    if (!user) return Promise.resolve(state);
    const { name } = user;
    const newUser = Object.assign({}, user, { name: name + '!' });
    const newState = Object.assign({}, state, { user: newUser });
    return Promise.resolve(newState);
  };
};

// init

type ListenerProxy = (...args: any[]) => void;

type InitResponse = {
  on: (eventName: string, options?: any) => void;
  rootSelector: string;
  events: [string, string, ListenerProxy][];
  router: Router<void>;
};

const initEvents = (state: State): EventEmitter => {
  const events = new EventEmitter();
  const property = new PromisedState(state);
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
  events.on('update', (updater: Updater<State>): void => {
    property
      .update(updater)
      .then(state => view(state, false))
      .then(vtree => {
        events.emit('vtree-updated', vtree);
      });
  });
  return events;
};

const client = (state?: any): InitResponse => {
  const emitter = initEvents(state);
  const on = (eventName: string, options?: any): void => {
    emitter.on.apply(emitter, [eventName, options]);
  };
  const makeListenerProxy = (eventName: string): ListenerProxy => {
    return (...args: any[]): void => {
      emitter.emit.apply(emitter, [eventName].concat(args));
    };
  };
  const rootSelector = 'div#app';
  const events: [string, string, ListenerProxy][] = [
    ['a', 'click', makeListenerProxy('click-anchor')],
    ['button', 'click', makeListenerProxy('click-like')]
  ];
  const router = new Router<void>([
    ['/users', makeListenerProxy('list-users')],
    ['/users/:id', makeListenerProxy('show-user')]
  ]);
  return { events, on, rootSelector, router };
};

const server = (): { render: (path: string) => Promise<VirtualDOM.VTree> } => {
  const router = new Router<Updater<State>>([
    ['/users', () => listUserAction()],
    ['/users/:id', ([id]: string[]) => showUserAction(id)]
  ]);
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