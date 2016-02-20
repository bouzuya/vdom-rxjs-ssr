import { Observable } from 'rxjs';

import { Action } from '../../models/action';
import { User } from '../../models/user';

export default function updater$(
  action$: Observable<Action>
): Observable<(user: User) => User> {
  return action$
    .filter(({ type }) => type === 'go-to-user-show')
    .mergeMap(({ params: { id } }) => {
      return Observable.fromPromise(User.fetchUser(id));
    })
    .map((user: User) => () => user);
}
