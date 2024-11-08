export type Section = {
  id: string;
  title: string;
  content: string;
  type: 'card' | 'section';
  iconName?: string;
  createdAt: string;
  updatedAt?: string;
} 