import { Initializer, InitializerParameters } from '../framework/initializer';
import { Server } from '../framework/server';
import { VTree, h } from '../framework/view';
import { Route } from '../framework/router';

import { State } from './models/state';
import listUserInitializer from './initializers/list-user';
import showUserInitializer from './initializers/show-user';
import { view } from './view';

const routes: Route[] = [
  { path: '/users', name: 'user#index' },
  { path: '/users/:id', name: 'user#show' }
];

const initializers: { [name: string]: Initializer<State> } = {
  'user#index': listUserInitializer,
  'user#show': showUserInitializer
};

const render = (state: State): VTree => {
  return view(state, true);
};

export default function main() {
  const server = new Server(initializers, render, routes);
  server.run();
}
