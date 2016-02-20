import { Observable } from 'rxjs';

import { Action } from '../models/action';
import { User } from '../models/user';
import addLikeCount$ from './users/add-like-count';
import clear$ from './users/clear';
import reset$ from './users/reset';

export default function users$(
  state: User[],
  action$: Observable<Action>
): Observable<User[]> {
  return Observable
    .of(state)
    .merge(
      addLikeCount$,
      clear$,
      reset$
    )
    .scan((users: User[], updater: (users: User[]) => User[]) => {
      return updater(users);
    });
};

