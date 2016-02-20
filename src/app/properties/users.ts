import { Observable } from 'rxjs';
import { RouteResult } from '../../framework/router';

import { Action } from '../models/action';
import { User } from '../models/user';

export default function users$(
  state: User[],
  action$: Observable<Action>
): Observable<User[]> {
  type Updater = (users: User[]) => User[];
  const clearUsersUpdater$ = action$
    .filter(({ type }) => type === 'path-change')
    .filter(({ params: { route: { name } } }) => name !== 'user#index')
    .map(() => () => <User[]> []);
  const resetUsersUpdater$ = action$
    .filter(({ type }) => type === 'go-to-user-index')
    .mergeMap(() => Observable.fromPromise(User.fetchUsers()))
    .map((users) => () => users);
  const incrementLikeCountUpdater$ = action$
    .filter(({ type }) => type === 'increment-like-count')
    .map(({ params: { id } }) => (users: User[]) => {
      const user = users.filter(user => user.id === id)[0];
      if (user) user.likeCount += 1; // FIXME
      return users;
    });
  const updater$: Observable<Updater> = Observable
    .merge(
      clearUsersUpdater$,
      incrementLikeCountUpdater$,
      resetUsersUpdater$
    );
  return Observable
    .of(state)
    .merge(updater$)
    .scan((users: User[], updater: Updater) => updater(users));
};

