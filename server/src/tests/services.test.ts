import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput, type UpdateServiceInput } from '../schema';
import { 
  createService, 
  getServices, 
  getServiceById, 
  updateService, 
  deleteService 
} from '../handlers/services';
import { eq } from 'drizzle-orm';

// Test input data
const testServiceInput: CreateServiceInput = {
  name: 'Web Development',
  features: ['Responsive Design', 'SEO Optimization', 'Fast Loading'],
  whatsapp_link: 'https://wa.me/1234567890'
};

const secondServiceInput: CreateServiceInput = {
  name: 'Mobile App Development',
  features: ['Cross-platform', 'Native Performance', 'Push Notifications'],
  whatsapp_link: 'https://wa.me/0987654321'
};

describe('Services Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createService', () => {
    it('should create a service with all fields', async () => {
      const result = await createService(testServiceInput);

      expect(result.name).toEqual('Web Development');
      expect(result.features).toEqual(['Responsive Design', 'SEO Optimization', 'Fast Loading']);
      expect(result.whatsapp_link).toEqual('https://wa.me/1234567890');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should save service to database', async () => {
      const result = await createService(testServiceInput);

      const services = await db.select()
        .from(servicesTable)
        .where(eq(servicesTable.id, result.id))
        .execute();

      expect(services).toHaveLength(1);
      expect(services[0].name).toEqual('Web Development');
      expect(services[0].features).toEqual(['Responsive Design', 'SEO Optimization', 'Fast Loading']);
      expect(services[0].whatsapp_link).toEqual('https://wa.me/1234567890');
      expect(services[0].created_at).toBeInstanceOf(Date);
    });

    it('should create service with single feature', async () => {
      const singleFeatureInput: CreateServiceInput = {
        name: 'Consulting',
        features: ['Expert Advice'],
        whatsapp_link: 'https://wa.me/1111111111'
      };

      const result = await createService(singleFeatureInput);

      expect(result.features).toEqual(['Expert Advice']);
      expect(result.features).toHaveLength(1);
    });
  });

  describe('getServices', () => {
    it('should return empty array when no services exist', async () => {
      const results = await getServices();
      expect(results).toEqual([]);
    });

    it('should return all services', async () => {
      // Create test services
      await createService(testServiceInput);
      await createService(secondServiceInput);

      const results = await getServices();

      expect(results).toHaveLength(2);
      expect(results[0].name).toEqual('Web Development');
      expect(results[1].name).toEqual('Mobile App Development');
    });

    it('should return services with correct structure', async () => {
      await createService(testServiceInput);

      const results = await getServices();

      expect(results).toHaveLength(1);
      const service = results[0];
      expect(service.id).toBeDefined();
      expect(service.name).toBeDefined();
      expect(service.features).toBeDefined();
      expect(service.whatsapp_link).toBeDefined();
      expect(service.created_at).toBeInstanceOf(Date);
      expect(service.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('getServiceById', () => {
    it('should return null for non-existent service', async () => {
      const result = await getServiceById(999);
      expect(result).toBeNull();
    });

    it('should return service by id', async () => {
      const createdService = await createService(testServiceInput);

      const result = await getServiceById(createdService.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(createdService.id);
      expect(result!.name).toEqual('Web Development');
      expect(result!.features).toEqual(['Responsive Design', 'SEO Optimization', 'Fast Loading']);
    });

    it('should return correct service when multiple exist', async () => {
      const service1 = await createService(testServiceInput);
      const service2 = await createService(secondServiceInput);

      const result = await getServiceById(service2.id);

      expect(result!.id).toEqual(service2.id);
      expect(result!.name).toEqual('Mobile App Development');
    });
  });

  describe('updateService', () => {
    it('should update service name only', async () => {
      const createdService = await createService(testServiceInput);

      const updateInput: UpdateServiceInput = {
        id: createdService.id,
        name: 'Updated Web Development'
      };

      const result = await updateService(updateInput);

      expect(result.id).toEqual(createdService.id);
      expect(result.name).toEqual('Updated Web Development');
      expect(result.features).toEqual(testServiceInput.features); // Unchanged
      expect(result.whatsapp_link).toEqual(testServiceInput.whatsapp_link); // Unchanged
      expect(result.updated_at.getTime()).toBeGreaterThan(createdService.updated_at.getTime());
    });

    it('should update features only', async () => {
      const createdService = await createService(testServiceInput);

      const updateInput: UpdateServiceInput = {
        id: createdService.id,
        features: ['New Feature 1', 'New Feature 2']
      };

      const result = await updateService(updateInput);

      expect(result.features).toEqual(['New Feature 1', 'New Feature 2']);
      expect(result.name).toEqual(testServiceInput.name); // Unchanged
    });

    it('should update whatsapp_link only', async () => {
      const createdService = await createService(testServiceInput);

      const updateInput: UpdateServiceInput = {
        id: createdService.id,
        whatsapp_link: 'https://wa.me/9999999999'
      };

      const result = await updateService(updateInput);

      expect(result.whatsapp_link).toEqual('https://wa.me/9999999999');
      expect(result.name).toEqual(testServiceInput.name); // Unchanged
      expect(result.features).toEqual(testServiceInput.features); // Unchanged
    });

    it('should update all fields', async () => {
      const createdService = await createService(testServiceInput);

      const updateInput: UpdateServiceInput = {
        id: createdService.id,
        name: 'Comprehensive Development',
        features: ['Full Stack', 'DevOps', 'Testing'],
        whatsapp_link: 'https://wa.me/5555555555'
      };

      const result = await updateService(updateInput);

      expect(result.name).toEqual('Comprehensive Development');
      expect(result.features).toEqual(['Full Stack', 'DevOps', 'Testing']);
      expect(result.whatsapp_link).toEqual('https://wa.me/5555555555');
    });

    it('should throw error for non-existent service', async () => {
      const updateInput: UpdateServiceInput = {
        id: 999,
        name: 'Non-existent Service'
      };

      expect(updateService(updateInput)).rejects.toThrow(/service not found/i);
    });

    it('should persist updates in database', async () => {
      const createdService = await createService(testServiceInput);

      const updateInput: UpdateServiceInput = {
        id: createdService.id,
        name: 'Database Updated Service'
      };

      await updateService(updateInput);

      const dbService = await db.select()
        .from(servicesTable)
        .where(eq(servicesTable.id, createdService.id))
        .execute();

      expect(dbService[0].name).toEqual('Database Updated Service');
    });
  });

  describe('deleteService', () => {
    it('should delete existing service', async () => {
      const createdService = await createService(testServiceInput);

      await deleteService(createdService.id);

      const dbServices = await db.select()
        .from(servicesTable)
        .where(eq(servicesTable.id, createdService.id))
        .execute();

      expect(dbServices).toHaveLength(0);
    });

    it('should throw error for non-existent service', async () => {
      expect(deleteService(999)).rejects.toThrow(/service not found/i);
    });

    it('should only delete specified service', async () => {
      const service1 = await createService(testServiceInput);
      const service2 = await createService(secondServiceInput);

      await deleteService(service1.id);

      const remainingServices = await getServices();
      expect(remainingServices).toHaveLength(1);
      expect(remainingServices[0].id).toEqual(service2.id);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete service lifecycle', async () => {
      // Create
      const created = await createService(testServiceInput);
      expect(created.name).toEqual('Web Development');

      // Read
      const fetched = await getServiceById(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.id).toEqual(created.id);

      // Update
      const updated = await updateService({
        id: created.id,
        name: 'Advanced Web Development'
      });
      expect(updated.name).toEqual('Advanced Web Development');

      // Verify update persisted
      const refetched = await getServiceById(created.id);
      expect(refetched!.name).toEqual('Advanced Web Development');

      // Delete
      await deleteService(created.id);

      // Verify deletion
      const deleted = await getServiceById(created.id);
      expect(deleted).toBeNull();
    });

    it('should handle array operations correctly', async () => {
      const service = await createService({
        name: 'Test Service',
        features: ['Feature A', 'Feature B', 'Feature C'],
        whatsapp_link: 'https://wa.me/1234567890'
      });

      // Update with different array
      const updated = await updateService({
        id: service.id,
        features: ['New Feature X', 'New Feature Y']
      });

      expect(updated.features).toEqual(['New Feature X', 'New Feature Y']);
      expect(updated.features).toHaveLength(2);

      // Verify in database
      const dbService = await getServiceById(service.id);
      expect(dbService!.features).toEqual(['New Feature X', 'New Feature Y']);
    });
  });
});