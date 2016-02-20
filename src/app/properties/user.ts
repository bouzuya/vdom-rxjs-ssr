import { Observable } from 'rxjs';
import { RouteResult } from '../../framework/router';

import { Action } from '../models/action';
import { User } from '../models/user';

export default function user$(
  state: User,
  action$: Observable<Action>
): Observable<User> {
  type Updater = (user: User) => User;
  const changeNameUpdater$ = action$
    .filter(({ type }) => type === 'change-name')
    .map(() => (user: User) => {
      if (user) user.name += '!'; // FIXME
      return user;
    });
  const clearUserUpdater$ = action$
    .filter(({ type }) => type === 'path-change')
    .filter(({ params: { route: { name, params } } }) => {
      return name !== 'user#show';
    })
    .map(() => () => null);
  const incrementLikeCountUpdater$ = action$
    .filter(({ type }) => type === 'increment-like-count')
    .map(({ params: { id } }) => (user: User) => {
      if (user) user.likeCount += 1; // FIXME
      return user;
    });
  const resetUserUpdater$ = action$
    .filter(({ type }) => type === 'go-to-user-show')
    .mergeMap(({ params: { id } }) => {
      return Observable.fromPromise(User.fetchUser(id));
    })
    .map(user => () => user);
  const updater$: Observable<Updater> = Observable
    .merge(
      changeNameUpdater$,
      clearUserUpdater$,
      incrementLikeCountUpdater$,
      resetUserUpdater$
    );
  return Observable
    .of(state)
    .merge(updater$)
    .scan((user: User, updater: Updater) => updater(user));
};
