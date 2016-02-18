import { Observable } from 'rxjs';
import { Client } from '../framework/client';
import { DOM } from '../framework/dom';
import { VTree } from '../framework/view';
import { State } from './models/state';
import { User } from './models/user';
import { view } from './view';

const app = (
  { state, dom }: { state: State, dom: DOM }
): Observable<State> => {
  const click$ = dom
    .on('button', 'click')
    .map((event) => (<any> event.target).dataset.userId);
  const users$ = Observable
    .of(state.users)
    .merge(click$.map((id) => (users: User[]) => {
      const user = users.filter(user => user.id === parseInt(id, 10))[0];
      // FIXME:
      if (user) user.likeCount += 1;
      return users;
    }))
    .scan((users: User[], update: (users: User[]) => User[]) => update(users));
  const user$ = Observable
    .of(state.user)
    .merge(click$.map(() => (user: User) => {
      // FIXME:
      if (user) user.likeCount += 1;
      return user;
    }))
    .scan((user: User, update: (user: User) => User) => update(user));
  const state$ = Observable
    .combineLatest(
      users$, user$,
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
