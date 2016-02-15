import { State, Updater } from '../models/state';
import { User } from '../models/user';

export default function clickLikeAction(id: string): Updater {
  return (state: State): Promise<State> => {
    const userId = parseInt(id, 10);
    return User
      .addLike(userId)
      .then(() => User.fetchUsers())
      .then(users => {
        return Object.assign({}, state, { users });
      });
  };
};

