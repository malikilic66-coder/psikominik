import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: LucideIcon;
  color: string;
  features: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  credentials: string[];
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  childAge: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
