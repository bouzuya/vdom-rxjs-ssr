import { makeClient, makeServer } from './libs/app';
import domEvents from './configs/dom-events';
import routes from './configs/routes';
import { State, Updater } from './models/state';
import { view } from './view';
import clickLikeAction from './actions/click-like-action';
import listUserAction from './actions/list-user-action';
import showUserAction from './actions/show-user-action';
import changeNameAction from './actions/change-name-action';

type EventAction = (...args: any[]) => void;
const initEvents = (
  emit: (eventName: string, options?: any) => void,
  initialState: State
): { [eventName: string]: EventAction }  => {
  const promisedState = State.promised(initialState);
  setInterval(() => emit('change-name'), 1000);
  return {
    'click-anchor': (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      const path = (<any> event.target).getAttribute('href');
      emit('go', path);
    },
    'click-like': (event: Event) => {
      const userId = (<any> event.target).dataset.userId;
      emit('update', clickLikeAction(userId));
    },
    'change-name': () => {
      emit('update', changeNameAction());
    },
    // events.on('go', ...)
    'list-users': () => {
      emit('update', listUserAction());
    },
    'show-user': ([id]: string[]) => {
      emit('update', showUserAction(id));
    },
    // events.on('state-updated', ...)
    'update': (updater: Updater): void => {
      promisedState
        .update(updater)
        .then(state => emit('state-updated', state));
    }
  };
};

type RouteAction = (params: string[]) => Updater;
const initRoutes = (): { [routeName: string]: RouteAction } => {
  return {
    'list-users': (_: string[]) => listUserAction(),
    'show-user': ([id]: string[]) => showUserAction(id)
  };
};

const rootSelector = 'div#app';
const initialState: State = { users: [], user: null };

const client = makeClient(routes, view, initEvents, domEvents, rootSelector);
const server = makeServer(routes, view, initRoutes, initialState);

export { client, server };
