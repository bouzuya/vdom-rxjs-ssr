import { State, Updater } from '../models/state';
import { User } from '../models/user';

export default function showUserAction(id: string): Updater {
  return (state: State): Promise<State> => {
    const userId = parseInt(id, 10);
    return User.fetchUser(userId)
      .then(user => Object.assign({}, state, ({ users: [], user })));
  };
};
