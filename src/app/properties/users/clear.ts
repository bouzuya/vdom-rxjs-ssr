import { Observable } from 'rxjs';

import { Action } from '../../models/action';
import { User } from '../../models/user';

export default function updater$(
  action$: Observable<Action>
): Observable<(user: User[]) => User[]> {
  return action$
    .filter(({ type }) => type === 'path-change')
    .filter(({ params: { route: { name } } }) => name !== 'user#index')
    .map(() => () => <User[]> []);
}
