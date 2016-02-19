import { Observable } from 'rxjs';
import { User } from '../models/user';
import { RouteResult } from '../../framework/router';

export default function users$(
  state: User[],
  route$: Observable<RouteResult>,
  clickedUserId$: Observable<string>
): Observable<User[]> {
  return Observable
    .of(state)
    .merge(
      route$
        .filter(({ name }) => name === 'user#index')
        .mergeMap(() => {
          return Observable.fromPromise(User.fetchUsers());
        })
        .map((users) => () => users),
      clickedUserId$.map((id) => (users: User[]) => {
        const user = users.filter(user => user.id === parseInt(id, 10))[0];
        // FIXME:
        if (user) user.likeCount += 1;
        return users;
      })
    )
    .scan((users: User[], update: (users: User[]) => User[]) => update(users));
};

