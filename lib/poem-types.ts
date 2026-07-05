export interface DailyVerse {
  id?: string;
  text: string;
  excerpt?: string;
  poet?: string;
  source?: string;
  url?: string;
  tags?: string[];
  mood?: string | null;
}
