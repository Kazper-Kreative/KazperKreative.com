import { client } from './client';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface Agent {
  name: string;
  role: string;
  bio: string;
  image: SanityImageSource;
  upworkUrl?: string;
  specialties?: string[];
  xp?: number;
  rank?: string;
  status?: string;
}

export async function getAgents(): Promise<Agent[]> {
  const query = `*[_type == "agent"]{
    name,
    role,
    bio,
    image,
    upworkUrl,
    specialties,
    xp,
    rank,
    status
  }`;
  return await client.fetch(query);
}
