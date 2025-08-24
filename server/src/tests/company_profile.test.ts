import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { companyProfileTable, teamMembersTable } from '../db/schema';
import { type UpdateCompanyProfileInput } from '../schema';
import { 
  getCompanyProfile, 
  updateCompanyProfile,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../handlers/company_profile';
import { eq } from 'drizzle-orm';

// Test data
const testCompanyProfileInput: UpdateCompanyProfileInput = {
  about_us: 'We are a leading technology company',
  vision: 'To transform the world through innovation',
  mission: 'Delivering excellence in every project',
  contact_info: 'contact@company.com',
  documentation_images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  proposal_url: 'https://example.com/proposal.pdf',
  legal_doc_url: 'https://example.com/legal.pdf'
};

const testTeamMemberInput = {
  name: 'John Doe',
  position: 'Software Engineer',
  description: 'Experienced developer with 5 years in tech',
  image_url: 'https://example.com/john.jpg'
};

describe('Company Profile Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('getCompanyProfile', () => {
    it('should return null when no profile exists', async () => {
      const result = await getCompanyProfile();
      expect(result).toBeNull();
    });

    it('should return company profile when one exists', async () => {
      // Create a profile first
      await updateCompanyProfile(testCompanyProfileInput);
      
      const result = await getCompanyProfile();
      
      expect(result).not.toBeNull();
      expect(result!.about_us).toEqual('We are a leading technology company');
      expect(result!.vision).toEqual('To transform the world through innovation');
      expect(result!.mission).toEqual('Delivering excellence in every project');
      expect(result!.contact_info).toEqual('contact@company.com');
      expect(result!.documentation_images).toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);
      expect(result!.proposal_url).toEqual('https://example.com/proposal.pdf');
      expect(result!.legal_doc_url).toEqual('https://example.com/legal.pdf');
      expect(result!.id).toBeDefined();
      expect(result!.created_at).toBeInstanceOf(Date);
      expect(result!.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('updateCompanyProfile', () => {
    it('should create new profile when none exists', async () => {
      const result = await updateCompanyProfile(testCompanyProfileInput);

      expect(result.about_us).toEqual('We are a leading technology company');
      expect(result.vision).toEqual('To transform the world through innovation');
      expect(result.mission).toEqual('Delivering excellence in every project');
      expect(result.contact_info).toEqual('contact@company.com');
      expect(result.documentation_images).toEqual(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']);
      expect(result.proposal_url).toEqual('https://example.com/proposal.pdf');
      expect(result.legal_doc_url).toEqual('https://example.com/legal.pdf');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should update existing profile', async () => {
      // Create initial profile
      const initialProfile = await updateCompanyProfile(testCompanyProfileInput);

      // Update with partial data
      const updateInput: UpdateCompanyProfileInput = {
        about_us: 'Updated about us section',
        vision: 'Updated vision statement'
      };

      const result = await updateCompanyProfile(updateInput);

      expect(result.id).toEqual(initialProfile.id);
      expect(result.about_us).toEqual('Updated about us section');
      expect(result.vision).toEqual('Updated vision statement');
      expect(result.mission).toEqual('Delivering excellence in every project'); // Should remain unchanged
      expect(result.contact_info).toEqual('contact@company.com'); // Should remain unchanged
      expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
    });

    it('should handle null values correctly', async () => {
      const inputWithNulls: UpdateCompanyProfileInput = {
        about_us: 'Test about us',
        vision: 'Test vision',
        mission: 'Test mission',
        contact_info: 'test@example.com',
        documentation_images: [],
        proposal_url: null,
        legal_doc_url: null
      };

      const result = await updateCompanyProfile(inputWithNulls);

      expect(result.proposal_url).toBeNull();
      expect(result.legal_doc_url).toBeNull();
      expect(result.documentation_images).toEqual([]);
    });

    it('should save profile to database', async () => {
      const result = await updateCompanyProfile(testCompanyProfileInput);

      const profiles = await db.select()
        .from(companyProfileTable)
        .where(eq(companyProfileTable.id, result.id))
        .execute();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].about_us).toEqual('We are a leading technology company');
      expect(profiles[0].vision).toEqual('To transform the world through innovation');
    });
  });

  describe('getTeamMembers', () => {
    it('should return empty array when no team members exist', async () => {
      const result = await getTeamMembers();
      expect(result).toEqual([]);
    });

    it('should return all team members', async () => {
      // Create test team members
      await createTeamMember(testTeamMemberInput);
      await createTeamMember({
        name: 'Jane Smith',
        position: 'Designer',
        description: 'Creative designer with 3 years experience',
        image_url: 'https://example.com/jane.jpg'
      });

      const result = await getTeamMembers();

      expect(result).toHaveLength(2);
      expect(result[0].name).toEqual('John Doe');
      expect(result[1].name).toEqual('Jane Smith');
    });
  });

  describe('createTeamMember', () => {
    it('should create team member with all fields', async () => {
      const result = await createTeamMember(testTeamMemberInput);

      expect(result.name).toEqual('John Doe');
      expect(result.position).toEqual('Software Engineer');
      expect(result.description).toEqual('Experienced developer with 5 years in tech');
      expect(result.image_url).toEqual('https://example.com/john.jpg');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it('should create team member with minimal fields', async () => {
      const minimalInput = {
        name: 'Alice Johnson',
        position: 'Product Manager'
      };

      const result = await createTeamMember(minimalInput);

      expect(result.name).toEqual('Alice Johnson');
      expect(result.position).toEqual('Product Manager');
      expect(result.description).toBeNull();
      expect(result.image_url).toBeNull();
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it('should save team member to database', async () => {
      const result = await createTeamMember(testTeamMemberInput);

      const teamMembers = await db.select()
        .from(teamMembersTable)
        .where(eq(teamMembersTable.id, result.id))
        .execute();

      expect(teamMembers).toHaveLength(1);
      expect(teamMembers[0].name).toEqual('John Doe');
      expect(teamMembers[0].position).toEqual('Software Engineer');
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member with partial data', async () => {
      // Create initial team member
      const initialMember = await createTeamMember(testTeamMemberInput);

      const updateInput = {
        id: initialMember.id,
        name: 'John Updated',
        position: 'Senior Software Engineer'
      };

      const result = await updateTeamMember(updateInput);

      expect(result.id).toEqual(initialMember.id);
      expect(result.name).toEqual('John Updated');
      expect(result.position).toEqual('Senior Software Engineer');
      expect(result.description).toEqual('Experienced developer with 5 years in tech'); // Should remain unchanged
      expect(result.image_url).toEqual('https://example.com/john.jpg'); // Should remain unchanged
      expect(result.created_at).toEqual(initialMember.created_at);
    });

    it('should update team member with null values', async () => {
      const initialMember = await createTeamMember(testTeamMemberInput);

      const updateInput = {
        id: initialMember.id,
        description: null,
        image_url: null
      };

      const result = await updateTeamMember(updateInput);

      expect(result.description).toBeNull();
      expect(result.image_url).toBeNull();
      expect(result.name).toEqual('John Doe'); // Should remain unchanged
      expect(result.position).toEqual('Software Engineer'); // Should remain unchanged
    });

    it('should throw error when team member not found', async () => {
      const updateInput = {
        id: 999,
        name: 'Non-existent'
      };

      expect(updateTeamMember(updateInput)).rejects.toThrow(/Team member with id 999 not found/i);
    });

    it('should save updates to database', async () => {
      const initialMember = await createTeamMember(testTeamMemberInput);

      await updateTeamMember({
        id: initialMember.id,
        name: 'Updated Name'
      });

      const teamMembers = await db.select()
        .from(teamMembersTable)
        .where(eq(teamMembersTable.id, initialMember.id))
        .execute();

      expect(teamMembers[0].name).toEqual('Updated Name');
    });
  });

  describe('deleteTeamMember', () => {
    it('should delete existing team member', async () => {
      const member = await createTeamMember(testTeamMemberInput);

      await deleteTeamMember(member.id);

      const teamMembers = await db.select()
        .from(teamMembersTable)
        .where(eq(teamMembersTable.id, member.id))
        .execute();

      expect(teamMembers).toHaveLength(0);
    });

    it('should throw error when team member not found', async () => {
      expect(deleteTeamMember(999)).rejects.toThrow(/Team member with id 999 not found/i);
    });

    it('should not affect other team members', async () => {
      const member1 = await createTeamMember(testTeamMemberInput);
      const member2 = await createTeamMember({
        name: 'Jane Smith',
        position: 'Designer'
      });

      await deleteTeamMember(member1.id);

      const remainingMembers = await getTeamMembers();
      expect(remainingMembers).toHaveLength(1);
      expect(remainingMembers[0].id).toEqual(member2.id);
      expect(remainingMembers[0].name).toEqual('Jane Smith');
    });
  });
});