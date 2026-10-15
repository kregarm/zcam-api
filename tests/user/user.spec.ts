import { test, expect } from '@playwright/test';
import { buildUser, createUser } from '../../utils';

test.describe('User', () => {
  let usernames: string[];

  test.beforeEach(() => {
    usernames = [];
  });

  test.afterEach(async ({ request }) => {
    for (const username of usernames) await request.delete(`user/${username}`);
  });

  test('creates a user', async ({ request }) => {
    const user = buildUser();
    usernames.push(user.username);

    const response = await request.post('user', { data: user });
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe(String(user.id));
  });

  test('gets a user by username', async ({ request }) => {
    const user = buildUser();
    usernames.push(user.username);
    await createUser(request, user);

    const response = await request.get(`user/${user.username}`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(user);
  });

  test('updates a user', async ({ request }) => {
    const user = buildUser();
    usernames.push(user.username);
    await createUser(request, user);

    const updated = { ...user, firstName: 'Changed' };
    const response = await request.put(`user/${user.username}`, { data: updated });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`user/${user.username}`);
    expect(await getResponse.json()).toEqual(updated);
  });

  test('deletes a user', async ({ request }) => {
    const user = buildUser();
    usernames.push(user.username);
    await createUser(request, user);

    const response = await request.delete(`user/${user.username}`);
    expect(response.status()).toBe(200);
    usernames = [];

    const getResponse = await request.get(`user/${user.username}`);
    expect(getResponse.status()).toBe(404);
  });

  test('creates users with list', async ({ request }) => {
    const users = [buildUser(), buildUser()];
    usernames.push(...users.map((u) => u.username));

    const response = await request.post('user/createWithList', { data: users });
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe('ok');

    for (const user of users) {
      const getResponse = await request.get(`user/${user.username}`);
      expect(await getResponse.json()).toEqual(user);
    }
  });

  test('creates users with array', async ({ request }) => {
    const users = [buildUser(), buildUser()];
    usernames.push(...users.map((u) => u.username));

    const response = await request.post('user/createWithArray', { data: users });
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toBe('ok');

    for (const user of users) {
      const getResponse = await request.get(`user/${user.username}`);
      expect(await getResponse.json()).toEqual(user);
    }
  });

  test('logs in and out', async ({ request }) => {
    const user = buildUser();
    usernames.push(user.username);
    await createUser(request, user);

    const loginResponse = await request.get('user/login', { params: { username: user.username, password: user.password } });
    expect(loginResponse.status()).toBe(200);
    expect((await loginResponse.json()).message).toContain('logged in user session');

    const logoutResponse = await request.get('user/logout');
    expect(logoutResponse.status()).toBe(200);
    expect((await logoutResponse.json()).message).toBe('ok');
  });

  test('returns 404 for an unknown user', async ({ request }) => {
    const response = await request.get(`user/${buildUser().username}`);
    expect(response.status()).toBe(404);
    expect((await response.json()).message).toBe('User not found');
  });
});
