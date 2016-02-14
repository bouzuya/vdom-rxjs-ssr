import { User } from '../models/user';
import { PromisedStateUpdater } from 'promised-state';

type State = {
  users: User[];
  user: User;
};

type Updater = PromisedStateUpdater<State>;

export { State, Updater };