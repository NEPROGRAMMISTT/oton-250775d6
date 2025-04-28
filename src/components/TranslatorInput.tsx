
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
    
    if (text.trim()) {
      // Split text into tokens (words, spaces, punctuation)
      const regex = /([а-яА-ЯёЁ]+(?:\s+[а-яА-ЯёЁ]+)*|[^а-яА-ЯёЁ\s]+|\s+)/g;
      const tokens = text.match(regex) || [];
      
      const results: DictionaryWord[] = [];
      
      tokens.forEach(token => {
        // If it contains Russian characters
        if (/[а-яА-ЯёЁ]/.test(token)) {
          // Try to find phrase first
          const normalizedToken = token.toLowerCase().replace(/ё/g, 'е').trim();
          let found = dictionary.words.find(
            dictWord => dictWord.russian.toLowerCase().replace(/ё/g, 'е') === normalizedToken
          );
          
          if (!found && token.includes(' ')) {
            // If phrase not found, split into individual words
            const words = token.split(/\s+/);
            const translatedWords: DictionaryWord[] = [];
            
            words.forEach(word => {
              const normalizedWord = word.toLowerCase().replace(/ё/g, 'е');
              const foundWord = dictionary.words.find(
                dictWord => dictWord.russian.toLowerCase().replace(/ё/g, 'е') === normalizedWord
              );
              
              if (foundWord) {
                const resultWord = { ...foundWord };
                if (word[0] === word[0].toUpperCase()) {
                  resultWord.dolgan = resultWord.dolgan.charAt(0).toUpperCase() + resultWord.dolgan.slice(1);
                }
                translatedWords.push(resultWord);
              } else {
                translatedWords.push({
                  category: "not-found",
                  russian: word,
                  dolgan: word
                });
              }
            });
            
            // Add space between translated words
            translatedWords.forEach((word, index) => {
              results.push(word);
              if (index < translatedWords.length - 1) {
                results.push({
                  category: "formatting",
                  russian: " ",
                  dolgan: " "
                });
              }
            });
          } else {
            // Single word or found phrase
            if (found) {
              // Preserve capitalization
              if (token[0] === token[0].toUpperCase()) {
                found = {
                  ...found,
                  dolgan: found.dolgan.charAt(0).toUpperCase() + found.dolgan.slice(1)
                };
              }
              results.push(found);
            } else {
              results.push({
                category: "not-found",
                russian: token,
                dolgan: token
              });
            }
          }
        } else {
          // Non-Russian characters (punctuation, spaces)
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
