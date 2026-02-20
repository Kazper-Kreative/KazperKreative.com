import { client } from './client';

export type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT' | 'GUEST';

export interface Profile {
  _id: string;
  _type: 'agent' | 'client';
  name: string;
  email: string;
  role?: string;
  xp?: number;
}

/**
 * Resolves a Sanity profile (Agent or Client) by email.
 */
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const query = `*[_type in ["agent", "client"] && email == $email][0]`;
  return await client.fetch(query, { email });
}

/**
 * Creates a initial Client profile in Sanity for a new user.
 */
export async function initializeClientProfile(name: string, email: string) {
  const existing = await getProfileByEmail(email);
  if (existing) return existing;

  const doc = {
    _type: 'client',
    name,
    email,
    xp: 0,
  };

  return await client.create(doc);
}
