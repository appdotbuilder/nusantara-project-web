import { db } from '../db';
import { servicesTable } from '../db/schema';
import { type CreateServiceInput, type UpdateServiceInput, type Service } from '../schema';
import { eq } from 'drizzle-orm';

export const createService = async (input: CreateServiceInput): Promise<Service> => {
  try {
    const result = await db.insert(servicesTable)
      .values({
        name: input.name,
        features: input.features,
        whatsapp_link: input.whatsapp_link
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Service creation failed:', error);
    throw error;
  }
};

export const getServices = async (): Promise<Service[]> => {
  try {
    const results = await db.select()
      .from(servicesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    throw error;
  }
};

export const getServiceById = async (id: number): Promise<Service | null> => {
  try {
    const results = await db.select()
      .from(servicesTable)
      .where(eq(servicesTable.id, id))
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch service:', error);
    throw error;
  }
};

export const updateService = async (input: UpdateServiceInput): Promise<Service> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof servicesTable.$inferInsert> = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.features !== undefined) {
      updateData.features = input.features;
    }
    if (input.whatsapp_link !== undefined) {
      updateData.whatsapp_link = input.whatsapp_link;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    const result = await db.update(servicesTable)
      .set(updateData)
      .where(eq(servicesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Service not found');
    }

    return result[0];
  } catch (error) {
    console.error('Service update failed:', error);
    throw error;
  }
};

export const deleteService = async (id: number): Promise<void> => {
  try {
    const result = await db.delete(servicesTable)
      .where(eq(servicesTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Service not found');
    }
  } catch (error) {
    console.error('Service deletion failed:', error);
    throw error;
  }
};