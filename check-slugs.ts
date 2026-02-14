import { client } from './src/sanity/lib/client';

async function checkSlugs() {
  try {
    const slugs = await client.fetch('*[_type == "project"].slug.current');
    console.log('Project Slugs:', slugs);
  } catch (error) {
    console.error('Error fetching slugs:', error);
  }
}

checkSlugs();
