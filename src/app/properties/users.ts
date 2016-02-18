import { Observable } from 'rxjs';
import { User } from '../models/user';

export default function user$(
  state: User[],
  clickedUserId$: Observable<string>
): Observable<User[]> {
  return Observable
    .of(state)
    .merge(clickedUserId$.map((id) => (users: User[]) => {
      const user = users.filter(user => user.id === parseInt(id, 10))[0];
      // FIXME:
      if (user) user.likeCount += 1;
      return users;
    }))
    .scan((users: User[], update: (users: User[]) => User[]) => update(users));
};

