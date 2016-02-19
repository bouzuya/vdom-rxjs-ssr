import { Initializer, InitializerParameters } from '../framework/initializer';
import { Server } from '../framework/server';
import { VTree, h } from '../framework/view';

import { routes } from './configs/routes';
import listUserInitializer from './initializers/list-user';
import showUserInitializer from './initializers/show-user';
import { State } from './models/state';
import { view } from './view';

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
