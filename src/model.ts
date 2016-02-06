import { EventEmitter } from 'events';
import { State } from './state';
import { User } from './user';
import { routes } from './routes';
import { view } from './view';

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

const listUserAction = (): Promise<State> => {
  return fetchUsers()
    .then(users => ({ users, user: null }));
};

const showUserAction = ([id]: string[]): Promise<State> => {
  const userId = parseInt(id, 10);
  return fetchUser(userId)
    .then(user => ({ users: [], user }));
};

const model = (path: string): Promise<State> => {
  return routes([
    ['/users', listUserAction],
    ['/users/:id', showUserAction]
  ], path);
};

type RequestActionOptions = {
  path: string;
  done: (error: Error, vtree?: any) => void;
};

const requestAction = ({ path, done }: RequestActionOptions): void => {
  model(path)
    .then(state => {
      const vtree = view(state, true);
      done(null, vtree);
    }, (error: Error) => {
      done(error);
    });
};

const init = (): ((eventName: string, options: any) => void) => {
  const events = new EventEmitter();
  events.on('request', requestAction);
  return (eventName: string, options: any): void => {
    events.emit(eventName, options);
  };
};

const changeName = (state: State): State => {
  const { user } = state;
  if (!user) return state;
  const { name } = user;
  const newUser = Object.assign({}, user, { name: name + '!' });
  const newState = Object.assign({}, state, { user: newUser });
  return newState;
};

const initClient = (state: any) => {
  const events = new EventEmitter();
  events.on('request', requestAction);
  events.on('change-name', () => events.emit('update', changeName));
  events.on('update', (update: (state: State) => State): void => {
    state = update(state);
    const vtree = view(state, false);
    events.emit('vtree-updated', vtree);
  });
  const emit = (eventName: string, options?: any): void => {
    events.emit(eventName, options);
  };
  const on = (eventName: string, options?: any): void => {
    events.on.apply(events, [eventName, options]);
  };
  return { emit, on };
};

export { model, init, initClient };