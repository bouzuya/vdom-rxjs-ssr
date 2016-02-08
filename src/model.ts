import { EventEmitter } from 'events';
import { State } from './state';
import { User } from './user';
import { routes } from './routes';
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

type InitResponse = {
  emit: (eventName: string, options?: any) => void;
  on: (eventName: string, options?: any) => void;
  rootSelector: string;
  events: [string, string, EventListener][];
};

type RequestActionOptions = {
  path: string;
  done: (error: Error, vtree?: any) => void;
};

const makePathToHandler = (routeConfig: any[]) => {
  return (path: string) => routes(routeConfig, path);
};

const initEvents = (state: State): EventEmitter => {
  const events = new EventEmitter();
  const property = new PromisedState(state);
  const pathToUpdater = makePathToHandler([
    ['/users', () => listUserAction()],
    ['/users/:id', ([id]: string[]) => showUserAction(id)]
  ]);
  setInterval(() => events.emit('change-name'), 1000);
  events.on('click-like', (event: Event) => {
    const userId = (<any> event.target).dataset.userId;
    events.emit('update', clickLikeAction(userId));
  });
  events.on('change-name', () => {
    events.emit('update', changeNameAction());
  });
  events.on('list-users', () => {
    events.emit('update', listUserAction());
  });
  events.on('request', ({ path, done }: RequestActionOptions): void => {
    property
      .update(pathToUpdater(path))
      .then(state => view(state, true))
      .then(vtree => {
        done(null, vtree);
      }, (error: Error) => {
        done(error);
      });
  });
  events.on('show-user', (id: string) => {
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

const init = (state?: any): InitResponse => {
  const emitter = initEvents(state);
  const emit = (eventName: string, options?: any): void => {
    emitter.emit(eventName, options);
  };
  const on = (eventName: string, options?: any): void => {
    emitter.on.apply(emitter, [eventName, options]);
  };
  const makeEventListener = (eventName: string): EventListener => {
    return (event: Event): void => { emit(eventName, event); };
  };
  const rootSelector = 'div#app';
  const events: [string, string, EventListener][] = [
    ['button', 'click', makeEventListener('click-like')]
  ];
  return { emit, on, events, rootSelector };
};

export { init };