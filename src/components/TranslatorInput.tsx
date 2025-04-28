
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
    
    // Find matching words in dictionary
    const words = text.toLowerCase().split(/\s+/).filter(word => word);
    const results = words.reduce((acc: DictionaryWord[], word) => {
      const found = dictionary.words.find(
        dictWord => dictWord.russian.toLowerCase() === word.toLowerCase()
      );
      if (found) acc.push(found);
      return acc;
    }, []);
    
    onTranslate(text, results);
  };

  return (
    <div className="ios-card p-4">
      <h2 className="text-lg font-medium mb-2">Введите текст для перевода</h2>
      <textarea
        value={inputText}
        onChange={handleInputChange}
        className="ios-input min-h-[100px] resize-none"
        placeholder="Введите текст на русском языке..."
      />
    </div>
  );
};

export default TranslatorInput;
