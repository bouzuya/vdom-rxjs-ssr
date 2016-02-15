import { State } from '../models/state';
import { User } from '../models/user';

export default function listUserInitializer(): Promise<State> {
  return User
    .fetchUsers()
    .then(users => ({ users, user: null }));
};
