import { Observable } from 'rxjs';
import { User } from '../models/user';

export default function user$(
  state: User,
  clickedUserId$: Observable<string>,
  timer$: Observable<any>
): Observable<User> {
  return Observable
    .of(state)
    .merge(
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
