
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
      
      // If no dictionaries, initialize with defaults
      return dictionaryService.initializeDefaultDictionaries();
    } catch (error) {
      console.error("Error loading dictionaries:", error);
      return dictionaryService.initializeDefaultDictionaries();
    }
  },

  // Check cache size and limits
  getCacheInfo: (): Promise<{size: number, maxSize: number, percentage: number}> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        navigator.serviceWorker.controller.postMessage(
          { action: 'GET_CACHE_INFO' },
          [messageChannel.port2]
        );
      } else {
        resolve({ size: 0, maxSize: 50 * 1024 * 1024, percentage: 0 });
      }
    });
  },

  // Clear cache
  clearCache: (): Promise<{success: boolean, newSize: number}> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        navigator.serviceWorker.controller.postMessage(
          { action: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      } else {
        resolve({ success: false, newSize: 0 });
      }
    });
  },

  // Initialize with default dictionaries including any from data folder
  initializeDefaultDictionaries: async (): Promise<Dictionary[]> => {
    const dictionaries: Dictionary[] = [sampleDictionary];
    
    try {
      // Fetch the list of available dictionaries from public/data
      const response = await fetch('/data/');
      if (!response.ok) {
        console.error("Failed to fetch dictionary list");
        throw new Error("Failed to fetch dictionary list");
      }
      
      // Load all dictionaries from public/data folder
      await dictionaryService.loadDictionariesFromPublicData(dictionaries);
      
    } catch (error) {
      console.error("Error loading dictionaries from public/data:", error);
    }
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionaries));
    return dictionaries;
  },
  
  // Load all dictionaries from public/data folder
  loadDictionariesFromPublicData: async (dictionaries: Dictionary[]): Promise<void> => {
    try {
      // List of known dictionary files in public/data
      const knownDictFiles = ['dolgan_language.json', 'binary_language.json'];
      
      for (const fileName of knownDictFiles) {
        try {
          const response = await fetch(`/data/${fileName}`);
          if (!response.ok) {
            console.warn(`Dictionary file ${fileName} not found or couldn't be loaded`);
            continue;
          }
          
          const data = await response.json();
          
          // Check if this is a raw dictionary format (key-value pairs)
          if (typeof data === 'object' && !Array.isArray(data) && data !== null && !('info' in data)) {
            // Convert raw format to Dictionary structure
            const languageName = fileName.split('_')[0];
            const capitalizedName = languageName.charAt(0).toUpperCase() + languageName.slice(1);
            
            const words = Object.entries(data).map(([russian, translation]) => ({
              russian,
              dolgan: translation as string,
              category: 'basic'
            }));
            
            const newDictionary: Dictionary = {
              info: {
                from_language: "Русский",
                to_language: capitalizedName,
                author: "Автоматически загружен",
                categories: ["basic"],
                languages: ["Русский", capitalizedName],
                parameters: "",
                social_media: {}
              },
              words
            };
            
            // Check if we already have this dictionary
            const exists = dictionaries.some(dict => 
              dict.info.from_language === newDictionary.info.from_language && 
              dict.info.to_language === newDictionary.info.to_language
            );
            
            if (!exists) {
              dictionaries.push(newDictionary);
              console.info(`Successfully loaded ${capitalizedName} dictionary with ${words.length} words`);
            }
          } 
          // If it's already a Dictionary structure
          else if (typeof data === 'object' && 'info' in data && 'words' in data) {
            const newDictionary = data as Dictionary;
            
            // Check if we already have this dictionary
            const exists = dictionaries.some(dict => 
              dict.info.from_language === newDictionary.info.from_language && 
              dict.info.to_language === newDictionary.info.to_language &&
              dict.info.author === newDictionary.info.author
            );
            
            if (!exists) {
              dictionaries.push(newDictionary);
              console.info(`Successfully loaded ${newDictionary.info.to_language} dictionary with ${newDictionary.words.length} words`);
            }
          } else {
            console.warn(`Dictionary file ${fileName} has unknown format`);
          }
        } catch (error) {
          console.error(`Error processing dictionary file ${fileName}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading dictionaries from public/data:", error);
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
