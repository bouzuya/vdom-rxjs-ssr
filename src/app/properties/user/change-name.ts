import { Observable } from 'rxjs';

import { Action } from '../../models/action';
import { User } from '../../models/user';

export default function updater$(
  action$: Observable<Action>
): Observable<(user: User) => User> {
  return action$
    .filter(({ type }) => type === 'change-name')
    .map(() => (user: User) => {
      if (user) user.name += '!'; // FIXME
      return user;
    });
}
