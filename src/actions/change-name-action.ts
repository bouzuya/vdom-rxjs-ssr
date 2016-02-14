import { State, Updater } from '../models/state';

export default function changeNameAction(): Updater {
  return (state: State): Promise<State> => {
    const { user } = state;
    if (!user) return Promise.resolve(state);
    const { name } = user;
    const newUser = Object.assign({}, user, { name: name + '!' });
    const newState = Object.assign({}, state, { user: newUser });
    return Promise.resolve(newState);
  };
};

