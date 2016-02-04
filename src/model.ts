import { State } from './state';
import { User } from './user';
import { routes } from './routes';

// dummy storage
const users: User[] = [
  { name: 'user1', bio: 'Hello!' },
  { name: 'user2', bio: 'Hi!' },
  { name: 'user3', bio: '!olleH' }
];

const fetchUsers = (): Promise<User[]> => {
  return Promise.resolve(users);
};

const fetchUser = (id: number): Promise<User> => {
  return Promise.resolve(users[id]);
};

const showUserAction = ([id]: string[]): Promise<State> => {
  const userId = parseInt(id, 10);
  return fetchUser(userId)
    .then(user => ({ user }));
};

const model = (path: string): Promise<State> => {
  return routes([
    ['/users/:id', showUserAction]
  ], path);
};

export { model };