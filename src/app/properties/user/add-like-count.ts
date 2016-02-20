import { Observable } from 'rxjs';

import { Action } from '../../models/action';
import { User } from '../../models/user';

export default function updater$(
  action$: Observable<Action>
): Observable<(user: User) => User> {
  return action$
    .filter(({ type }) => type === 'increment-like-count')
    .map(({ params: { id } }) => (user: User) => {
      if (!user) return user;
      if (user.id !== id) return user;
      user.likeCount += 1; // FIXME
      return user;
    });
}
