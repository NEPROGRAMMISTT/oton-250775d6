
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
        // Изменён путь для корректной работы с ServiceWorker
        const response = await fetch('/src/data/dolgan_language.json');
        const data = await response.json();
        setDolganDictionary(data);
        console.log('Успешно загружен словарь долганского языка');
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
    const results: DictionaryWord[] = [];
    let processedText = text;
    
    // Function to normalize Russian text (handle 'ё' and case)
    const normalizeRussian = (text: string): string => {
      return text.toLowerCase().replace(/ё/g, 'е');
    };
    
    // Create word dictionary with normalized keys for faster lookups
    const wordDictionary = new Map<string, DictionaryWord>();
    dictionary.words.forEach(word => {
      wordDictionary.set(normalizeRussian(word.russian), word);
    });
    
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
      let maxWordsToCheck = 256; // Увеличенный максимум слов для проверки
      let found = false;
      
      for (let phraseLength = maxWordsToCheck; phraseLength > 0; phraseLength--) {
        if (i + phraseLength * 2 - 1 > tokens.length) continue; // Not enough tokens left
        
        // Collect the phrase (words + spaces)
        const phraseTokens: string[] = [];
        let isValidPhrase = true;
        
        for (let j = 0; j < phraseLength; j++) {
          const wordIndex = i + j * 2; // Skip spaces
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
        
        // Check if the token is a number
        if (/^\d+$/.test(word)) {
          const numberWord = convertNumberToWord(word);
          if (numberWord) {
            const normalizedNumberWord = normalizeRussian(numberWord);
            const translatedNumberWord = wordDictionary.get(normalizedNumberWord);
            if (translatedNumberWord) {
              resultTokens.push({
                category: "number",
                russian: word + ` (${numberWord})`,
                dolgan: translatedNumberWord.dolgan
              });
            } else {
              resultTokens.push({
                category: "number",
                russian: word + ` (${numberWord})`,
                dolgan: word
              });
            }
          } else {
            resultTokens.push({
              category: "not-found",
              russian: word,
              dolgan: word
            });
          }
          i++;
          continue;
        }
        
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
    
    onTranslate(text, resultTokens);
  };

  // Функция для преобразования цифры в слово на русском
  const convertNumberToWord = (numberStr: string): string | null => {
    const num = parseInt(numberStr, 10);
    
    // Улучшенная функция для поддержки чисел до 999
    if (isNaN(num) || num < 0 || num > 999) {
      return null;
    }
    
    const units = [
      'ноль', 'один', 'два', 'три', 'четыре', 'пять', 
      'шесть', 'семь', 'восемь', 'девять'
    ];
    
    const teens = [
      'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
      'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'
    ];
    
    const tens = [
      '', 'десять', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 
      'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'
    ];
    
    const hundreds = [
      '', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 
      'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'
    ];
    
    if (num === 0) return 'ноль';
    
    let result = '';
    
    // Обработка сотен
    if (num >= 100) {
      result += hundreds[Math.floor(num / 100)] + ' ';
    }
    
    // Обработка десятков и единиц
    const remainder = num % 100;
    
    if (remainder >= 10 && remainder < 20) {
      // Числа 10-19 имеют специальные названия
      result += teens[remainder - 10];
    } else {
      // Десятки и единицы отдельно
      const tensDigit = Math.floor(remainder / 10);
      const unitsDigit = remainder % 10;
      
      if (tensDigit > 0) {
        result += tens[tensDigit];
        if (unitsDigit > 0) result += ' ';
      }
      
      if (unitsDigit > 0 || num === 0) {
        result += units[unitsDigit];
      }
    }
    
    return result.trim();
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
