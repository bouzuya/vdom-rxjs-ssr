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

const changeName = (state: State): Promise<State> => {
  const { user } = state;
  if (!user) return Promise.resolve(state);
  const { name } = user;
  const newUser = Object.assign({}, user, { name: name + '!' });
  const newState = Object.assign({}, state, { user: newUser });
  return Promise.resolve(newState);
};

type InitResponse = {
  emit: (eventName: string, options?: any) => void;
  on: (eventName: string, options?: any) => void;
};

const init = (state?: any): InitResponse => {
  const events = new EventEmitter();
  events.on('request', requestAction);
  events.on('change-name', () => events.emit('update', changeName));
  events.on('update', (update: (state: State) => Promise<State>): void => {
    update(state)
      .then(newState => state = newState)
      .then(newState => {
        const vtree = view(newState, false);
        events.emit('vtree-updated', vtree);
      });
  });
  const emit = (eventName: string, options?: any): void => {
    events.emit(eventName, options);
  };
  const on = (eventName: string, options?: any): void => {
    events.on.apply(events, [eventName, options]);
  };
  return { emit, on };
};

export { model, init };