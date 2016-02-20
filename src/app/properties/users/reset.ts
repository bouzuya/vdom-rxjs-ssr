import { Observable } from 'rxjs';

import { Action } from '../../models/action';
import { User } from '../../models/user';

export default function updater$(
  action$: Observable<Action>
): Observable<(users: User[]) => User[]> {
  return action$
    .filter(({ type }) => type === 'go-to-user-index')
    .mergeMap(() => Observable.fromPromise(User.fetchUsers()))
    .map((users: User[]) => () => users);
}
