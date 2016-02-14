import { State, Updater } from '../models/state';

export default function clickLikeAction(id: string): Updater {
  return (state: State): Promise<State> => {
    const userId = parseInt(id, 10);
    const newUsers = state.users.map(user => {
      if (user.id !== userId) return user;
      return Object.assign({}, user, { likeCount: user.likeCount + 1 });
    });
    return Promise.resolve(Object.assign({}, state, { users: newUsers }));
  };
};

