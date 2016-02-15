import { Observable } from 'rxjs';
import { Client } from '../framework/client';
import { VTree } from '../framework/view';
import { State } from './models/state';
import { view } from './view';

const app = (
  { state }: { state: State }
): Observable<State> => {
  const users$ = Observable
    .of(state.users);
  const user$ = Observable
    .of(state.user)
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
