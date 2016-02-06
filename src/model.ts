import { EventEmitter } from 'events';
import { State } from './state';
import { User } from './user';
import { routes } from './routes';
import { view } from './view';
import { Property, Updater } from './property';

// Resource

// dummy storage
const users: User[] = [
  { id: 0, name: 'user1', bio: 'Hello!' },
  { id: 1, name: 'user2', bio: 'Hi!' },
  { id: 2, name: 'user3', bio: '!olleH' }
];

const fetchUsers = (): Promise<User[]> => {
  return Promise.resolve(users);
};

const fetchUser = (id: number): Promise<User> => {
  return Promise.resolve(users[id]);
};

// Updater

const listUserAction = (): Updater<State> => {
  return (state: State): Promise<State> => {
    return fetchUsers()
      .then(user => Object.assign({}, state, ({ users, user: null })));
  };;
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
  const property = new Property(state);
  const pathToUpdater = makePathToHandler([
    ['/users', () => listUserAction()],
    ['/users/:id', ([id]: string[]) => showUserAction(id)]
  ]);
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
  const events = initEvents(state);
  const emit = (eventName: string, options?: any): void => {
    events.emit(eventName, options);
  };
  const on = (eventName: string, options?: any): void => {
    events.on.apply(events, [eventName, options]);
  };
  return { emit, on };
};

export { init };