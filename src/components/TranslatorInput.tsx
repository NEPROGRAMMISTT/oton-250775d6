import React from 'react';
import { Dictionary, DictionaryWord } from '../types/dictionary';

interface TranslatorInputProps {
  dictionary: Dictionary;
  onTranslate: (text: string, results: DictionaryWord[]) => void;
}

const TranslatorInput: React.FC<TranslatorInputProps> = ({ 
  dictionary, 
  onTranslate 
}) => {
  const [inputText, setInputText] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    // Improved translation logic that preserves formatting
    if (text.trim()) {
      // Split text into words, preserving punctuation and spaces
      const regex = /([а-яА-ЯёЁ]+|[^а-яА-ЯёЁ\s]+|\s+)/g;
      const tokens = text.match(regex) || [];
      
      const results: DictionaryWord[] = [];
      
      tokens.forEach(token => {
        // If it's a Russian word, try to translate it
        if (/[а-яА-ЯёЁ]+/.test(token)) {
          // Normalize the token (lowercase and replace 'ё' with 'е')
          const normalizedToken = token.toLowerCase().replace(/ё/g, 'е');
          
          // Find in dictionary (case-insensitive)
          const found = dictionary.words.find(
            dictWord => dictWord.russian.toLowerCase().replace(/ё/g, 'е') === normalizedToken
          );
          
          if (found) {
            // Create a copy to preserve the original formatting
            const resultWord = { ...found };
            
            // If the original token was capitalized, capitalize the translation
            if (token[0] === token[0].toUpperCase()) {
              resultWord.dolgan = resultWord.dolgan.charAt(0).toUpperCase() + resultWord.dolgan.slice(1);
            }
            
            results.push(resultWord);
          } else {
            // Word not found in dictionary, keep original
            results.push({
              category: "not-found",
              russian: token,
              dolgan: token
            });
          }
        } else {
          // Non-Russian word (punctuation, space, etc.), keep as is
          results.push({
            category: "formatting",
            russian: token,
            dolgan: token
          });
        }
      });
      
      onTranslate(text, results);
    } else {
      onTranslate('', []);
    }
  };

  return (
    <div className="ios-card p-4">
      <h2 className="text-lg font-medium mb-2">Введите текст для перевода</h2>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        className="ios-input min-h-[100px] resize-none w-full"
        placeholder="Введите текст на русском языке..."
      />
    </div>
  );
};

export default TranslatorInput;
