import { Observable } from 'rxjs';
import { User } from '../models/user';
import { RouteResult } from '../../framework/router';

export default function user$(
  state: User,
  route$: Observable<RouteResult>,
  clickedUserId$: Observable<string>,
  timer$: Observable<any>
): Observable<User> {
  return Observable
    .of(state)
    .merge(
      route$
        .filter(route => route.name === 'user#show')
        .mergeMap(({ params: { id } }) => {
          return Observable.fromPromise(User.fetchUser(parseInt(id, 10)));
        })
        .map((user) => () => user),
      route$
        .filter(route => route.name !== 'user#show')
        .map(() => () => null),
      clickedUserId$.map(() => (user: User) => {
        // FIXME:
        if (user) user.likeCount += 1;
        return user;
      }),
      timer$.map(() => (user: User) => {
        // FIXME:
        if (user) user.name += '!'
        return user;
      }))
    .scan((user: User, update: (user: User) => User) => update(user));
};
