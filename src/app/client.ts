import { Observable } from 'rxjs';
import { Client } from '../framework/client';
import { DOM } from '../framework/dom';
import { VTree } from '../framework/view';
import { State } from './models/state';
import { User } from './models/user';
import { view } from './view';
import user$ from './properties/user';
import users$ from './properties/users';

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
