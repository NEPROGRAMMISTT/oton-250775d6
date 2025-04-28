
import React from 'react';
import { DictionaryWord } from '../types/dictionary';

interface TranslationResultsProps {
  sourceText: string;
  results: DictionaryWord[];
  fromLanguage: string;
  toLanguage: string;
}

const TranslationResults: React.FC<TranslationResultsProps> = ({
  sourceText,
  results,
  fromLanguage,
  toLanguage
}) => {
  // Group results by category
  const resultsByCategory = results.reduce((acc: Record<string, DictionaryWord[]>, word) => {
    const category = word.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(word);
    return acc;
  }, {});

  return (
    <div className="ios-card overflow-hidden">
      <div className="flex justify-between px-4 py-3 border-b border-ios-separator">
        <div className="font-medium">{fromLanguage}</div>
        <div className="font-medium">{toLanguage}</div>
      </div>
      
      {results.length === 0 ? (
        <div className="p-4 text-center text-ios-text-secondary">
          {sourceText ? 'Перевод не найден' : 'Введите текст для перевода'}
        </div>
      ) : (
        <div>
          {Object.entries(resultsByCategory).map(([category, words]) => (
            <div key={category}>
              <div className="ios-section-header">{category}</div>
              {words.map((word, index) => (
                <div key={index} className="ios-list-item last:border-b-0">
                  <div className="font-medium">{word.russian}</div>
                  <div className="text-ios-primary">{word.dolgan}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranslationResults;
