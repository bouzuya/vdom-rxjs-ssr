import { User } from '../models/user';
import { PromisedState, PromisedStateUpdater } from 'promised-state';

class State {
  users: User[];
  user: User;

  static promised(initial: State): PromisedState<State> {
    return new PromisedState(initial);
  }
};

type Updater = PromisedStateUpdater<State>;

export { State, Updater };