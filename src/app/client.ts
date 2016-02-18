import { Observable } from 'rxjs';
import { Client } from '../framework/client';
import { DOM } from '../framework/dom';
import { VTree } from '../framework/view';
import { State } from './models/state';
import { User } from './models/user';
import { view } from './view';

const user$ = (
  state: User,
  clickedUserId$: Observable<string>,
  timer$: Observable<any>
): Observable<User> => {
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

const users$ = (
  state: User[],
  clickedUserId$: Observable<string>
): Observable<User[]> => {
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

const app = (
  { state, dom }: { state: State, dom: DOM }
): Observable<State> => {
  const timer$ = Observable
    .interval(1000);
  const clickedUserId$ = dom
    .on('button', 'click')
    .map((event) => (<any> event.target).dataset.userId);
  const state$ = Observable
    .combineLatest(
      users$(state.users, clickedUserId$),
      user$(state.user, clickedUserId$, timer$),
      (users, user) => {
        return { users, user };
      });
  return state$;
};

const render = (state: State): VTree => {
  return view(state, false);
};

export default function main() {
  const client = new Client('div#app', render, app);
  client.run();
}
