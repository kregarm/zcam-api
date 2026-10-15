import { APIRequestContext, expect } from '@playwright/test';

/** Only for the routes the spec secures with api_key: GET/DELETE pet/{petId} and GET store/inventory. */
export const apiKeyHeader = { api_key: process.env.PETSTORE_API_KEY! };

/**
 * Unique, JS-safe numeric id.
 *
 * Ids are always supplied by the client: when omitted, the server generates values
 * around 9.2e18, which exceed Number.MAX_SAFE_INTEGER and get corrupted by JSON.parse.
 * Date.now() * 1000 (~1.8e15) stays well inside the safe range.
 */
export function uniqueId(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

/** Full, valid pet payload with a unique id. Pass overrides for the fields a test cares about. */
export function buildPet(overrides: Record<string, unknown> = {}) {
  const id = uniqueId();
  return {
    id,
    category: { id: 1, name: 'Dogs' },
    name: `Rex ${id}`,
    photoUrls: ['https://example.com/rex.jpg'],
    tags: [{ id: 101, name: `zcam-${id}` }],
    status: 'available',
    ...overrides,
  };
}

/** Valid store order with a unique id. The API does not check that petId exists. */
export function buildOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: uniqueId(),
    petId: 1,
    quantity: 2,
    status: 'placed',
    ...overrides,
  };
}

/** Full, valid user payload with a unique id and username. */
export function buildUser(overrides: Record<string, unknown> = {}) {
  const id = uniqueId();
  return {
    id,
    username: `zcam${id}`,
    firstName: 'Martin',
    lastName: 'Tester',
    email: `zcam${id}@example.com`,
    password: 'secret',
    phone: '123456789',
    userStatus: 0,
    ...overrides,
  };
}

export async function createPet(request: APIRequestContext, pet: ReturnType<typeof buildPet>) {
  expect((await request.post('pet', { data: pet })).status()).toBe(200);
}

export async function createOrder(request: APIRequestContext, order: ReturnType<typeof buildOrder>) {
  expect((await request.post('store/order', { data: order })).status()).toBe(200);
}

export async function createUser(request: APIRequestContext, user: ReturnType<typeof buildUser>) {
  expect((await request.post('user', { data: user })).status()).toBe(200);
}
