import { Observable } from 'rxjs';

import { Action } from '../models/action';
import { User } from '../models/user';
import addLikeCount$ from './user/add-like-count';
import changeName$ from './user/change-name';
import clear$ from './user/clear';
import reset$ from './user/reset';

export default function user$(
  state: User,
  action$: Observable<Action>
): Observable<User> {
  return Observable
    .of(state)
    .merge(
      addLikeCount$(action$),
      changeName$(action$),
      clear$(action$),
      reset$(action$)
    )
    .scan((user: User, updater: (user: User) => User) => updater(user));
};
