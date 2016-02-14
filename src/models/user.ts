
class User {
  id: number;
  name: string;
  bio: string;
  likeCount: number;

  static fetchUsers(): Promise<User[]> {
    return Promise.resolve(users);
  }

  static fetchUser(id: number): Promise<User> {
    return Promise.resolve(users[id]);
  }
}

// dummy storage
const users: User[] = [
  { id: 0, name: 'user1', bio: 'Hello!', likeCount: 2 },
  { id: 1, name: 'user2', bio: 'Hi!', likeCount: 1 },
  { id: 2, name: 'user3', bio: '!olleH', likeCount: 0 }
];

export { User };