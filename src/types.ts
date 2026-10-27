export interface Attachment {
  name: string;
  url: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'secfen' | 'conc' | 'curso' | 'evento' | 'estag' | 'alocsala' | 'destaque';
  categoryLabel: string;
  publishedAt: string;
  author: string;
  featuredImage?: string;
  attachments?: Attachment[];
  departmentId?: string;
  isHero?: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  icon: string;
  description: string;
  coordinator: string;
  contactEmail: string;
  courses: string[];
  laboratories: string[];
}

export interface PostGradProgram {
  id: string;
  name: string;
  code: string;
  degree: string;
  description: string;
  researchLines: string[];
}

export type Tab = 'home' | 'news' | 'departments' | 'postgrad' | 'secfen';
