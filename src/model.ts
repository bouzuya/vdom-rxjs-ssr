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

const makeChangeName = (): Updater<State> => {
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

const init = (state?: any): InitResponse => {
  const property = new Property(state);
  const events = new EventEmitter();
  events.on('request', ({ path, done }: RequestActionOptions): void => {
    const updater = routes([
      ['/users', () => listUserAction()],
      ['/users/:id', ([id]: string[]) => showUserAction(id)]
    ], path);
    property
      .update(updater)
      .then(state => {
        const vtree = view(state, true);
        done(null, vtree);
      }, (error: Error) => {
        done(error);
      });
  });
  events.on('change-name', () => events.emit('update', makeChangeName()));
  events.on('list-users', () => events.emit('update', listUserAction()));
  events.on('show-user', (id: string) =>
    events.emit('update', showUserAction(id))
  );
  events.on('update', (update: Updater<State>): void => {
    property
      .update(update)
      .then(state => {
        const vtree = view(state, false);
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

export { init };