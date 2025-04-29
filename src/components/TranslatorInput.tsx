
import React, { useEffect, useState } from 'react';
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
  const [dolganDictionary, setDolganDictionary] = useState<Record<string, string>>({});

  // Load the dolgan_language.json dictionary for phrases
  useEffect(() => {
    const loadDolganDictionary = async () => {
      try {
        const response = await fetch('/src/data/dolgan_language.json');
        const data = await response.json();
        setDolganDictionary(data);
      } catch (error) {
        console.error('Error loading dolgan dictionary:', error);
      }
    };

    loadDolganDictionary();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    if (text.trim()) {
      translateText(text);
    } else {
      onTranslate('', []);
    }
  };

  const translateText = (text: string) => {
    // Check if we have any phrases to translate first
    let processedText = text;
    const results: DictionaryWord[] = [];
    
    // Sort phrases by length (longest first) to match the longest phrases first
    const phrases = Object.keys(dolganDictionary).sort((a, b) => b.length - a.length);
    
    // First, try to match phrases from dolgan_language.json
    for (const phrase of phrases) {
      const phraseRegex = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = [...processedText.matchAll(phraseRegex)];
      
      if (matches.length > 0) {
        let lastIndex = 0;
        let newText = '';
        
        for (const match of matches) {
          const matchIndex = match.index as number;
          
          // Add text before the match
          if (matchIndex > lastIndex) {
            const beforeText = processedText.substring(lastIndex, matchIndex);
            newText += beforeText;
          }
          
          // Add the phrase to results
          const dolganPhrase = dolganDictionary[phrase.toLowerCase()];
          results.push({
            category: "phrase",
            russian: match[0],
            dolgan: match[0][0].toUpperCase() === match[0][0] 
              ? dolganPhrase.charAt(0).toUpperCase() + dolganPhrase.slice(1)
              : dolganPhrase
          });
          
          // Replace the phrase with a placeholder
          const placeholder = `__PHRASE_${results.length - 1}__`;
          newText += placeholder;
          
          lastIndex = matchIndex + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < processedText.length) {
          newText += processedText.substring(lastIndex);
        }
        
        processedText = newText;
      }
    }
    
    // Now process remaining text for single words and formatting
    const regex = /(__PHRASE_\d+__)|([а-яА-ЯёЁ]+(?:\s+[а-яА-ЯёЁ]+)*)|([^а-яА-ЯёЁ\s]+|\s+)/g;
    const tokens = processedText.match(regex) || [];
    
    const finalResults: DictionaryWord[] = [];
    
    tokens.forEach(token => {
      // Handle phrase placeholders
      if (token.startsWith('__PHRASE_')) {
        const phraseIndex = parseInt(token.match(/\d+/)![0]);
        finalResults.push(results[phraseIndex]);
      }
      // If it contains Russian characters, translate individual words
      else if (/[а-яА-ЯёЁ]/.test(token)) {
        // Try to find exact phrase first
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
            finalResults.push(word);
            if (index < translatedWords.length - 1) {
              finalResults.push({
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
            finalResults.push(found);
          } else {
            finalResults.push({
              category: "not-found",
              russian: token,
              dolgan: token
            });
          }
        }
      } else {
        // Non-Russian characters (punctuation, spaces)
        finalResults.push({
          category: "formatting",
          russian: token,
          dolgan: token
        });
      }
    });
    
    onTranslate(text, finalResults);
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
