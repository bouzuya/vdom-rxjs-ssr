import { State, Updater } from '../models/state';
import { User } from '../models/user';

export default function listUserAction(): Updater {
  return (state: State): Promise<State> => {
    return User.fetchUsers()
      .then(users => Object.assign({}, state, ({ users, user: null })));
  };
};
