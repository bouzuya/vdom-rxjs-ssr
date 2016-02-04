import { State } from './state';
import { User } from './user';

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

const model = (params: any): Promise<State> => {
  const userId = parseInt(params.userId, 10);
  return fetchUser(userId)
    .then(user => ({ user }));
};

export { model };