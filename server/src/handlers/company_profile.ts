import { db } from '../db';
import { companyProfileTable, teamMembersTable } from '../db/schema';
import { type UpdateCompanyProfileInput, type CompanyProfile, type TeamMember } from '../schema';
import { eq } from 'drizzle-orm';

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  try {
    const results = await db.select()
      .from(companyProfileTable)
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to fetch company profile:', error);
    throw error;
  }
}

export async function updateCompanyProfile(input: UpdateCompanyProfileInput): Promise<CompanyProfile> {
  try {
    // First check if a profile exists
    const existingProfile = await getCompanyProfile();

    if (existingProfile) {
      // Update existing profile
      const updateData: any = { updated_at: new Date() };
      
      if (input.about_us !== undefined) updateData.about_us = input.about_us;
      if (input.vision !== undefined) updateData.vision = input.vision;
      if (input.mission !== undefined) updateData.mission = input.mission;
      if (input.contact_info !== undefined) updateData.contact_info = input.contact_info;
      if (input.documentation_images !== undefined) updateData.documentation_images = input.documentation_images;
      if (input.proposal_url !== undefined) updateData.proposal_url = input.proposal_url;
      if (input.legal_doc_url !== undefined) updateData.legal_doc_url = input.legal_doc_url;

      const results = await db.update(companyProfileTable)
        .set(updateData)
        .where(eq(companyProfileTable.id, existingProfile.id))
        .returning()
        .execute();

      return results[0];
    } else {
      // Create new profile
      const results = await db.insert(companyProfileTable)
        .values({
          about_us: input.about_us || '',
          vision: input.vision || '',
          mission: input.mission || '',
          contact_info: input.contact_info || '',
          documentation_images: input.documentation_images || [],
          proposal_url: input.proposal_url || null,
          legal_doc_url: input.legal_doc_url || null
        })
        .returning()
        .execute();

      return results[0];
    }
  } catch (error) {
    console.error('Failed to update company profile:', error);
    throw error;
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const results = await db.select()
      .from(teamMembersTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    throw error;
  }
}

export async function createTeamMember(input: {
  name: string;
  position: string;
  description?: string | null;
  image_url?: string | null;
}): Promise<TeamMember> {
  try {
    const results = await db.insert(teamMembersTable)
      .values({
        name: input.name,
        position: input.position,
        description: input.description || null,
        image_url: input.image_url || null
      })
      .returning()
      .execute();

    return results[0];
  } catch (error) {
    console.error('Failed to create team member:', error);
    throw error;
  }
}

export async function updateTeamMember(input: {
  id: number;
  name?: string;
  position?: string;
  description?: string | null;
  image_url?: string | null;
}): Promise<TeamMember> {
  try {
    const updateData: any = {};
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.position !== undefined) updateData.position = input.position;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;

    const results = await db.update(teamMembersTable)
      .set(updateData)
      .where(eq(teamMembersTable.id, input.id))
      .returning()
      .execute();

    if (results.length === 0) {
      throw new Error(`Team member with id ${input.id} not found`);
    }

    return results[0];
  } catch (error) {
    console.error('Failed to update team member:', error);
    throw error;
  }
}

export async function deleteTeamMember(id: number): Promise<void> {
  try {
    const results = await db.delete(teamMembersTable)
      .where(eq(teamMembersTable.id, id))
      .returning()
      .execute();

    if (results.length === 0) {
      throw new Error(`Team member with id ${id} not found`);
    }
  } catch (error) {
    console.error('Failed to delete team member:', error);
    throw error;
  }
}