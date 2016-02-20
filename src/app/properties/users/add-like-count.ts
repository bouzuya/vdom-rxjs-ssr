import { Observable } from 'rxjs';

import { Action } from '../../models/action';
import { User } from '../../models/user';

export default function updater$(
  action$: Observable<Action>
): Observable<(user: User[]) => User[]> {
  return action$
    .filter(({ type }) => type === 'increment-like-count')
    .map(({ params: { id } }) => (users: User[]) => {
      const user = users.filter(user => user.id === id)[0];
      if (user) user.likeCount += 1; // FIXME
      return users;
    });
}
