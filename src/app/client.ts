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
    .on('button', 'click');
  const users$ = Observable
    .of(state.users);
  const user$ = Observable
    .of(state.user)
    .merge(click$.map(() => (user: User) => {
      // FIXME:
      user.likeCount += 1;
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
