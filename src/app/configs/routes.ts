import { Route } from '../../framework/router';

const routes: Route[] = [
  { path: '/users', name: 'user#index' },
  { path: '/users/:id', name: 'user#show' }
];

export { routes };