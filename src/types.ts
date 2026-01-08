import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  path: string;
  isNew?: boolean;
  isBeta?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  localizedPath: (path: string) => string;
}

export interface FileItem {
  id: string;
  file: File;
  pages: number;
  width: number;
  height: number;
  thumbnailUrl?: string; // Preview image
}

export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED';

