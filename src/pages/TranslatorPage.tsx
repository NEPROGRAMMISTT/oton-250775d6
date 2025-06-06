import React from 'react';
import TabBar from '../components/TabBar';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { Copy, Bookmark, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const TranslatorPage: React.FC = () => {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);
  const [activeDictionary, setActiveDictionary] = React.useState<Dictionary | null>(null);
  const [sourceText, setSourceText] = React.useState('');
  const [translatedText, setTranslatedText] = React.useState('');

  React.useEffect(() => {
    // Load dictionaries on component mount
    const loadDictionaries = async () => {
      const loadedDictionaries = dictionaryService.getDictionaries();
      setDictionaries(loadedDictionaries);
      if (loadedDictionaries.length > 0) {
        setActiveDictionary(loadedDictionaries[0]);
      }
    };
    
    loadDictionaries();
  }, []);

  const translateText = React.useCallback((text: string) => {
    if (!activeDictionary || !text.trim()) {
      setTranslatedText('');
      return;
    }

    const results: DictionaryWord[] = [];
    let processedText = text;
    
    // Function to normalize Russian text (handle 'ё' and case)
    const normalizeRussian = (text: string): string => {
      return text.toLowerCase().replace(/ё/g, 'е');
    };
    
    // Create word dictionary with normalized keys for faster lookups
    const wordDictionary = new Map<string, DictionaryWord>();
    activeDictionary.words.forEach(word => {
      wordDictionary.set(normalizeRussian(word.russian), word);
    });
    
    // Parse dictionary parameters
    const dictionaryParams = activeDictionary.info.parameters?.split(',').reduce((acc, param) => {
      const trimmedParam = param.trim();
      if (trimmedParam) {
        acc[trimmedParam] = true;
      }
      return acc;
    }, {} as Record<string, boolean>) || {};

    // If no_probel parameter is enabled, translate each character independently
    if (dictionaryParams.no_probel) {
      const resultTokens: DictionaryWord[] = [];
      
      // Translate each character independently
      for (let i = 0; i < processedText.length; i++) {
        const char = processedText[i];
        const normalizedChar = normalizeRussian(char);
        
        if (wordDictionary.has(normalizedChar)) {
          const foundWord = wordDictionary.get(normalizedChar)!;
          resultTokens.push({...foundWord});
        } else {
          // Character not found in dictionary
          resultTokens.push({
            category: "not-found",
            russian: char,
            dolgan: char
          });
        }
      }
      
      const translated = resultTokens.map(word => word.dolgan).join('');
      setTranslatedText(translated);
      return;
    }
    
    // Standard translation for dictionaries without no_probel parameter
    // First: split into tokens (words, punctuation, spaces)
    const tokens: string[] = processedText.match(/([а-яА-ЯёЁ]+)|([^а-яА-ЯёЁ\s]+|\s+)/g) || [];
    const resultTokens: DictionaryWord[] = [];
    
    let i = 0;
    while (i < tokens.length) {
      // Skip non-Russian tokens (punctuation, spaces)
      if (!/[а-яА-ЯёЁ]/.test(tokens[i])) {
        resultTokens.push({
          category: "formatting",
          russian: tokens[i],
          dolgan: tokens[i]
        });
        i++;
        continue;
      }

      // Try to find multi-word phrases by combining consecutive Russian tokens
      let maxWordsToCheck = 256;
      let found = false;
      
      for (let phraseLength = maxWordsToCheck; phraseLength > 0; phraseLength--) {
        if (i + phraseLength * 2 - 1 > tokens.length) continue;
        
        // Collect the phrase (words + spaces)
        const phraseTokens: string[] = [];
        let isValidPhrase = true;
        
        for (let j = 0; j < phraseLength; j++) {
          const wordIndex = i + j * 2;
          const spaceIndex = wordIndex + 1;
          
          // Check if this is a word (not punctuation/space)
          if (wordIndex >= tokens.length || !/[а-яА-ЯёЁ]/.test(tokens[wordIndex])) {
            isValidPhrase = false;
            break;
          }
          
          phraseTokens.push(tokens[wordIndex]);
          
          // Add space if not the last word and there is a space
          if (j < phraseLength - 1) {
            if (spaceIndex >= tokens.length || !/\s/.test(tokens[spaceIndex])) {
              isValidPhrase = false;
              break;
            }
            phraseTokens.push(tokens[spaceIndex]);
          }
        }
        
        if (!isValidPhrase) continue;
        
        const phrase = phraseTokens.join('');
        const normalizedPhrase = normalizeRussian(phrase);
        
        // Check if the exact phrase exists in our dictionary
        if (wordDictionary.has(normalizedPhrase)) {
          const foundWord = wordDictionary.get(normalizedPhrase)!;
          const resultWord = { ...foundWord };
          
          // Preserve capitalization
          if (phrase[0] === phrase[0].toUpperCase()) {
            resultWord.dolgan = resultWord.dolgan.charAt(0).toUpperCase() + resultWord.dolgan.slice(1);
          }
          
          resultTokens.push(resultWord);
          
          // Skip all tokens that were part of this phrase
          i += phraseTokens.length;
          found = true;
          break;
        }
      }
      
      // If no phrase found, translate single word
      if (!found) {
        const word = tokens[i];
        const normalizedWord = normalizeRussian(word);
        
        if (wordDictionary.has(normalizedWord)) {
          const foundWord = wordDictionary.get(normalizedWord)!;
          const resultWord = { ...foundWord };
          
          // Preserve capitalization
          if (word[0] === word[0].toUpperCase()) {
            resultWord.dolgan = resultWord.dolgan.charAt(0).toUpperCase() + resultWord.dolgan.slice(1);
          }
          
          resultTokens.push(resultWord);
        } else {
          // Word not found in dictionary
          resultTokens.push({
            category: "not-found",
            russian: word,
            dolgan: word
          });
        }
        i++;
      }
    }
    
    const translated = resultTokens.map(word => word.dolgan).join('');
    setTranslatedText(translated);
  }, [activeDictionary]);

  React.useEffect(() => {
    translateText(sourceText);
  }, [sourceText, translateText]);

  const handleCopy = async () => {
    if (translatedText) {
      try {
        await navigator.clipboard.writeText(translatedText);
        toast.success('Текст скопирован');
      } catch (error) {
        toast.error('Не удалось скопировать текст');
      }
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const handleSwapLanguages = () => {
    // For now, just swap the text content
    const temp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(temp);
  };

  return (
    <div className="translator-container">
      {/* Header */}
      <div className="translator-header">
        <h1 className="translator-title">ПЕРЕВОДЧИК</h1>
      </div>

      {/* Main Content */}
      <div className="translator-content">
        {/* Source Text Section */}
        <div className="text-section">
          <div className="section-label">Текст</div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Введите текст для перевода..."
            className="text-area w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleCopy}
            className="action-button"
            disabled={!translatedText}
          >
            <Copy size={20} className="text-ios-text-secondary dark:text-ios-text-secondary-dark" />
          </button>
          <button className="action-button">
            <Bookmark size={20} className="text-ios-text-secondary dark:text-ios-text-secondary-dark" />
          </button>
          <button 
            onClick={handleClear}
            className="action-button"
            disabled={!sourceText && !translatedText}
          >
            <Trash2 size={20} className="text-ios-text-secondary dark:text-ios-text-secondary-dark" />
          </button>
        </div>

        {/* Translation Section */}
        <div className="text-section">
          <div className="section-label">Перевод</div>
          <textarea
            value={translatedText}
            readOnly
            placeholder="Перевод появится здесь..."
            className="text-area w-full"
          />
        </div>

        {/* Language Selector */}
        <div className="language-selector">
          <span className="language-text">
            {activeDictionary 
              ? `${activeDictionary.info.from_language} → ${activeDictionary.info.to_language}`
              : 'Выберите словарь'
            }
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
};

export default TranslatorPage;