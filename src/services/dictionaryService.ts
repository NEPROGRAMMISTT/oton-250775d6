
import { Dictionary } from "../types/dictionary";
import { sampleDictionary } from "../data/sampleDictionary";

const STORAGE_KEY = 'ios-translator-dictionaries';

export const dictionaryService = {
  // Get all dictionaries from local storage
  getDictionaries: (): Dictionary[] => {
    try {
      const storedDictionaries = localStorage.getItem(STORAGE_KEY);
      if (storedDictionaries) {
        const parsedDictionaries = JSON.parse(storedDictionaries);
        
        // Make sure we have at least one dictionary
        if (parsedDictionaries.length > 0) {
          return parsedDictionaries;
        }
      }
      
      // If no dictionaries, initialize with sample and try to load dolgan_language.json
      return dictionaryService.initializeDefaultDictionaries();
    } catch (error) {
      console.error("Error loading dictionaries:", error);
      return dictionaryService.initializeDefaultDictionaries();
    }
  },

  // Initialize with default dictionaries including any from data folder
  initializeDefaultDictionaries: (): Dictionary[] => {
    const dictionaries: Dictionary[] = [sampleDictionary];
    
    // Load dolgan_language.json
    try {
      const dolganDictionary = dictionaryService.createDolganDictionary();
      if (dolganDictionary) {
        dictionaries.push(dolganDictionary);
      }
    } catch (error) {
      console.error("Error loading dolgan dictionary:", error);
    }
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionaries));
    return dictionaries;
  },
  
  // Create a structured dictionary from dolgan_language.json
  createDolganDictionary: (): Dictionary | null => {
    try {
      // For client-side loading, we'll use fetch
      fetch('/src/data/dolgan_language.json')
        .then(response => response.json())
        .then(data => {
          const words = Object.entries(data).map(([russian, dolgan]) => ({
            russian,
            dolgan: dolgan as string,
            category: 'basic'
          }));
          
          const dolganDictionary: Dictionary = {
            info: {
              from_language: "Русский",
              to_language: "Долганский",
              author: "Автоматически загружен",
              description: "Словарь долганского языка",
              categories: ["basic"]
            },
            words
          };
          
          // Add to existing dictionaries
          const dictionaries = dictionaryService.getDictionaries();
          // Check if we already have this dictionary
          const exists = dictionaries.some(dict => 
            dict.info.from_language === "Русский" && 
            dict.info.to_language === "Долганский" &&
            dict.info.author === "Автоматически загружен"
          );
          
          if (!exists) {
            dictionaries.push(dolganDictionary);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionaries));
            console.info("Успешно загружен словарь долганского языка");
          }
          
          return dolganDictionary;
        })
        .catch(error => {
          console.error("Error fetching dolgan dictionary:", error);
          return null;
        });
      
      return null; // Initial return is null since fetch is asynchronous
    } catch (error) {
      console.error("Error creating dolgan dictionary:", error);
      return null;
    }
  },

  // Save a dictionary to local storage
  saveDictionary: (dictionary: Dictionary): void => {
    try {
      const dictionaries = dictionaryService.getDictionaries();
      
      // Check if dictionary already exists by author and languages
      const index = dictionaries.findIndex(
        d => d.info.author === dictionary.info.author && 
        d.info.from_language === dictionary.info.from_language &&
        d.info.to_language === dictionary.info.to_language
      );
      
      if (index !== -1) {
        // Update existing dictionary
        dictionaries[index] = dictionary;
      } else {
        // Add new dictionary
        dictionaries.push(dictionary);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionaries));
    } catch (error) {
      console.error("Error saving dictionary:", error);
    }
  },

  // Delete a dictionary from local storage
  deleteDictionary: (index: number): void => {
    try {
      const dictionaries = dictionaryService.getDictionaries();
      if (index >= 0 && index < dictionaries.length) {
        dictionaries.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionaries));
      }
    } catch (error) {
      console.error("Error deleting dictionary:", error);
    }
  },

  // Import dictionary from JSON file
  importDictionary: async (file: File): Promise<Dictionary | null> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const dictionary = JSON.parse(content) as Dictionary;
            dictionaryService.saveDictionary(dictionary);
            resolve(dictionary);
          } catch (error) {
            console.error("Error parsing dictionary file:", error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          reject(error);
        };
        reader.readAsText(file);
      });
    } catch (error) {
      console.error("Error importing dictionary:", error);
      return null;
    }
  },

  // Export dictionary to JSON file
  exportDictionary: (dictionary: Dictionary): void => {
    try {
      const dictionaryJson = JSON.stringify(dictionary, null, 2);
      const blob = new Blob([dictionaryJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `dictionary_${dictionary.info.from_language}_${dictionary.info.to_language}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting dictionary:", error);
    }
  }
};
