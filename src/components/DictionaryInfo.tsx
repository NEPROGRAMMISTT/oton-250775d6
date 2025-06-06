
import React from 'react';
import { Dictionary } from '../types/dictionary';
import { Button } from "@/components/ui/button";

interface DictionaryInfoProps {
  dictionary: Dictionary;
  onExport: () => void;
}

const DictionaryInfo: React.FC<DictionaryInfoProps> = ({ dictionary, onExport }) => {
  const { info } = dictionary;
  
  // Handle categories properly whether it's a string or an array
  const categories = Array.isArray(info.categories) 
    ? info.categories 
    : info.categories.split(',').filter(Boolean);
  
  // Extract parameters 
  const parameters = info.parameters.split(',').filter(Boolean);
  
  return (
    <div className="ios-card">
      <div className="p-4 border-b border-ios-separator dark:border-ios-separator-dark">
        <h2 className="text-lg font-medium mb-1">Информация о словаре</h2>
        <div className="text-sm text-ios-text-secondary dark:text-ios-text-secondary-dark mb-3">
          {info.from_language} → {info.to_language}
        </div>
        
        {info.author && (
          <div className="mb-2">
            <span className="text-sm text-ios-text-secondary dark:text-ios-text-secondary-dark">Автор: </span>
            <span>{info.author}</span>
          </div>
        )}
        
        <div className="mb-2">
          <span className="text-sm text-ios-text-secondary dark:text-ios-text-secondary-dark">Кол-во слов: </span>
          <span>{dictionary.words.length}</span>
        </div>
        
        {parameters.length > 0 && (
          <div className="mb-2">
            <span className="text-sm text-ios-text-secondary dark:text-ios-text-secondary-dark">Параметры: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {parameters.map(param => (
                <span 
                  key={param}
                  className="bg-ios-secondary/15 dark:bg-ios-secondary-dark/30 text-ios-text dark:text-ios-text-dark px-2 py-1 rounded-full text-xs"
                >
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {categories.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-ios-text-secondary dark:text-ios-text-secondary-dark">Категории: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {categories.map(category => (
                <span 
                  key={category}
                  className="bg-ios-secondary/15 dark:bg-ios-secondary-dark/30 text-ios-text dark:text-ios-text-dark px-2 py-1 rounded-full text-xs"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={onExport}
        className="w-full p-3 text-ios-primary dark:text-ios-primary-dark font-medium text-center"
      >
        Экспортировать словарь
      </button>
    </div>
  );
};

export default DictionaryInfo;
