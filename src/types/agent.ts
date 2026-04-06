export interface Agent {
  name: string;
  pictureUrl: string;
  role: string;
  bio: string;
  upworkUrl: string;
  specialties?: string[];
  xp?: number;
  rank?: string;
  status?: string;
}
