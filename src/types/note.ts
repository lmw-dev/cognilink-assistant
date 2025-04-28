export interface NoteMeta {
  path: string;
  title: string;
  frontmatter: Record<string, any>;
  tags: string[];
  links: string[];
} 