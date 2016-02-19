import { InitializerParameters } from '../../framework/initializer';

import { State } from '../models/state';
import { User } from '../models/user';

export default function showUserInitializer(
  params: InitializerParameters
): Promise<State> {
  const userId = parseInt(params['id'], 10);
  return User.fetchUser(userId)
    .then(user => ({ users: [], user }));
};
