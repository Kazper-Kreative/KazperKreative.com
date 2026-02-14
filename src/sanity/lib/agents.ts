import { client } from './client';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface Agent {
  name: string;
  role: string;
  bio: string;
  image: SanityImageSource;
  upworkUrl?: string;
  specialties?: string[];
}

export async function getAgents(): Promise<Agent[]> {
  const query = `*[_type == "agent"]{
    name,
    role,
    bio,
    image,
    upworkUrl,
    specialties
  }`;
  return await client.fetch(query);
}
