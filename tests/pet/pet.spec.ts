import { test, expect } from '@playwright/test';
import { apiKeyHeader, buildPet, createPet, uniqueId } from '../../utils';

test.describe('Pet', () => {
  let petId: number | undefined;

  test.beforeEach(() => {
    petId = undefined;
  });

  test.afterEach(async ({ request }) => {
    if (petId) await request.delete(`pet/${petId}`, { headers: apiKeyHeader });
  });

  test('creates a pet', async ({ request }) => {
    const pet = buildPet();
    petId = pet.id;

    const response = await request.post('pet', { data: pet });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(pet);
  });

  test('gets a pet by id', async ({ request }) => {
    const pet = buildPet();
    petId = pet.id;
    await createPet(request, pet);

    const response = await request.get(`pet/${pet.id}`, { headers: apiKeyHeader });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(pet);
  });

  test('returns 404 for an unknown pet', async ({ request }) => {
    const response = await request.get(`pet/${uniqueId()}`, { headers: apiKeyHeader });
    expect(response.status()).toBe(404);
    expect((await response.json()).message).toBe('Pet not found');
  });

  test('updates a pet', async ({ request }) => {
    const pet = buildPet();
    petId = pet.id;
    await createPet(request, pet);

    const updated = { ...pet, name: 'Max', status: 'pending' };
    const response = await request.put('pet', { data: updated });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`pet/${pet.id}`, { headers: apiKeyHeader });
    expect(await getResponse.json()).toEqual(updated);
  });

  test('updates a pet with form data', async ({ request }) => {
    const pet = buildPet();
    petId = pet.id;
    await createPet(request, pet);

    const response = await request.post(`pet/${pet.id}`, { form: { name: 'Max', status: 'sold' } });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`pet/${pet.id}`, { headers: apiKeyHeader });
    expect(await getResponse.json()).toEqual({ ...pet, name: 'Max', status: 'sold' });
  });

  test('deletes a pet', async ({ request }) => {
    const pet = buildPet();
    petId = pet.id;
    await createPet(request, pet);

    const response = await request.delete(`pet/${pet.id}`, { headers: apiKeyHeader });
    expect(response.status()).toBe(200);
    petId = undefined;

    const getResponse = await request.get(`pet/${pet.id}`, { headers: apiKeyHeader });
    expect(getResponse.status()).toBe(404);
  });

  test('uploads an image', async ({ request }) => {
    const pet = buildPet();
    petId = pet.id;
    await createPet(request, pet);

    const response = await request.post(`pet/${pet.id}/uploadImage`, {
      multipart: { file: { name: 'rex.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake image') } },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).message).toContain('rex.jpg');
  });

  test('finds pets by status', async ({ request }) => {
    const pet = buildPet({ status: 'sold' });
    petId = pet.id;
    await createPet(request, pet);

    const response = await request.get('pet/findByStatus', { params: { status: 'sold' } });
    expect(response.status()).toBe(200);
    expect(await response.json()).toContainEqual(pet);
  });
});
