import { Observable } from 'rxjs';
import { Client } from '../framework/client';
import { DOM } from '../framework/dom';
import { VTree } from '../framework/view';
import { HistoryRouter } from '../framework/history-router';

import { routes } from './configs/routes';
import { Action } from './models/action';
import { State } from './models/state';
import { User } from './models/user';
import user$ from './properties/user';
import users$ from './properties/users';
import { view } from './view';

const app = (
  { state, dom, history }: { state: State, dom: DOM, history: HistoryRouter }
): Observable<State> => {
  const clickAnchor$ = dom
    .on('a', 'click')
    .subscribe((event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      const path = (<any> event.target).getAttribute('href');
      history.go(path);
    });
  const route$ = history
    .changes();
  const timer$ = Observable
    .interval(1000);
  const clickedUserId$ = dom
    .on('button', 'click')
    .map((event) => (<any> event.target).dataset.userId);
  const goToUserIndexAction$ = route$
    .filter(({ name }) => name === 'user#index')
    .map(() => ({ type: 'go-to-user-index', params: {} }));
  const incrementLikeCountAction$ = clickedUserId$
    .map(id => parseInt(id, 10))
    .map(id => ({ type: 'increment-like-count', params: { id } }));
  const action$: Observable<Action> = Observable
    .merge(
      goToUserIndexAction$,
      incrementLikeCountAction$
    );
  const state$ = Observable
    .combineLatest(
      users$(state.users, action$),
      user$(state.user, route$, clickedUserId$, timer$),
      (users, user) => {
        return { users, user };
      });
  return state$;
};

const render = (state: State): VTree => {
  return view(state, false);
};

export default function main() {
  const client = new Client('div#app', render, app, routes);
  client.run();
}
