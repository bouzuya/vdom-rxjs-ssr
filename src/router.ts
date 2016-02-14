import { Router } from './libs/router';
import { Updater } from './models/state';
import { EventEmitter } from 'events';

import listUserAction from './actions/list-user-action';
import showUserAction from './actions/show-user-action';

type ListenerProxy = (...args: any[]) => void;
type ClientRouter = Router<void>;
type ServerRouter = Router<Updater>;

const makeClientRouter = (
  emit: (eventName: string, ...args: any[]) => any
): ClientRouter => {
  const makeListenerProxy = (eventName: string): ListenerProxy => {
    return (...args: any[]): void => {
      emit.apply(null, [eventName].concat(args));
    };
  };
  const router = new Router<void>([
    ['/users', makeListenerProxy('list-users')],
    ['/users/:id', makeListenerProxy('show-user')]
  ]);
  return router;
};

const makeServerRouter = (): ServerRouter => {
  const router = new Router<Updater>([
    ['/users', () => listUserAction()],
    ['/users/:id', ([id]: string[]) => showUserAction(id)]
  ]);
  return router;
};

export { makeClientRouter, makeServerRouter, ClientRouter, ServerRouter };