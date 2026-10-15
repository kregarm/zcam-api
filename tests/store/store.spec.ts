import { test, expect } from '@playwright/test';
import { apiKeyHeader, buildOrder, buildPet, createOrder, createPet, uniqueId } from '../../utils';

test.describe('Store', () => {
  let orderId: number | undefined;
  let petId: number | undefined;

  test.beforeEach(() => {
    orderId = undefined;
    petId = undefined;
  });

  test.afterEach(async ({ request }) => {
    if (orderId) await request.delete(`store/order/${orderId}`);
    if (petId) await request.delete(`pet/${petId}`, { headers: apiKeyHeader });
  });

  test('places an order', async ({ request }) => {
    const order = buildOrder();
    orderId = order.id;

    const response = await request.post('store/order', { data: order });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...order, complete: false });
  });

  test('gets an order by id', async ({ request }) => {
    const order = buildOrder();
    orderId = order.id;
    await createOrder(request, order);

    const response = await request.get(`store/order/${order.id}`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...order, complete: false });
  });

  test('deletes an order', async ({ request }) => {
    const order = buildOrder();
    orderId = order.id;
    await createOrder(request, order);

    const response = await request.delete(`store/order/${order.id}`);
    expect(response.status()).toBe(200);
    orderId = undefined;

    const getResponse = await request.get(`store/order/${order.id}`);
    expect(getResponse.status()).toBe(404);
  });

  test('returns 404 for an unknown order', async ({ request }) => {
    const response = await request.get(`store/order/${uniqueId()}`);
    expect(response.status()).toBe(404);
    expect((await response.json()).message).toBe('Order not found');
  });

  test('counts a pet in the inventory', async ({ request }) => {
    const pet = buildPet({ status: `zcam-${uniqueId()}` });
    petId = pet.id;
    await createPet(request, pet);

    const response = await request.get('store/inventory', { headers: apiKeyHeader });
    expect(response.status()).toBe(200);
    expect((await response.json())[pet.status]).toBe(1);
  });
});
