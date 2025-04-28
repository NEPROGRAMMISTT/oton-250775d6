
import { Dictionary } from "../types/dictionary";

export const sampleDictionary: Dictionary = {
  "info": {
    "author": "Sample Author",
    "languages": ["binary", "russian"],
    "from_language": "Русский",
    "to_language": "Бинарный",
    "parameters": "",
    "categories": "numbers,letters,greetings",
    "social_media": {
      "Веб-сайт": "example.com"
    }
  },
  "words": [
    {
      "category": "numbers",
      "dolgan": "00110001",
      "russian": "один"
    },
    {
      "category": "numbers",
      "dolgan": "00110010",
      "russian": "два"
    },
    {
      "category": "numbers",
      "dolgan": "00110011",
      "russian": "три"
    },
    {
      "category": "letters",
      "dolgan": "01000001",
      "russian": "А"
    },
    {
      "category": "letters",
      "dolgan": "01000010",
      "russian": "Б"
    },
    {
      "category": "letters",
      "dolgan": "01000011",
      "russian": "В"
    },
    {
      "category": "greetings",
      "dolgan": "01001000 01100101 01101100 01101100 01101111",
      "russian": "Привет"
    },
    {
      "category": "greetings",
      "dolgan": "01000111 01101111 01101111 01100100 01100010 01111001 01100101",
      "russian": "Пока"
    }
  ]
};
