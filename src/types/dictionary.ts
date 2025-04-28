
export interface DictionaryInfo {
  author: string;
  languages: string[];
  from_language: string;
  to_language: string;
  parameters: string;
  categories: string | string[];
  social_media: Record<string, string>;
}

export interface DictionaryWord {
  category: string;
  russian: string;
  dolgan: string;
  [key: string]: string; // To allow for different language fields
}

export interface Dictionary {
  info: DictionaryInfo;
  words: DictionaryWord[];
}
