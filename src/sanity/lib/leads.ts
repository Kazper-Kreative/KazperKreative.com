export interface ProjectLead {
  name: string;
  email: string;
  company?: string;
  projectType: 'game-dev' | 'web-app' | 'qa' | 'automation' | 'other';
  budget: 'under-5k' | '5k-15k' | '15k-50k' | '50k-plus';
  description: string;
}

/**
 * This will be used by the API route to validate and save leads.
 * Note: Storing leads in Sanity from an API route requires a token with write access.
 */
