import { State } from './state';
import { User } from './user';

// dummy storage
const users: User[] = [
  { name: 'user1', bio: 'Hello!' },
  { name: 'user2', bio: 'Hi!' },
  { name: 'user3', bio: '!olleH' }
];

const model = (params: any): State => {
  const userId = parseInt(params.userId, 10);
  return {
    user: users[userId]
  };
};

export { model };