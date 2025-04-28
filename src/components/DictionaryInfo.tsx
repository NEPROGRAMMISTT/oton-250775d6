
import React from 'react';
import { Dictionary } from '../types/dictionary';

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

  return (
    <div className="ios-card">
      <div className="p-4 border-b border-ios-separator">
        <h2 className="text-lg font-medium mb-1">Информация о словаре</h2>
        <div className="text-sm text-ios-text-secondary mb-3">
          {info.from_language} → {info.to_language}
        </div>
        
        {info.author && (
          <div className="mb-2">
            <span className="text-sm text-ios-text-secondary">Автор: </span>
            <span>{info.author}</span>
          </div>
        )}
        
        <div className="mb-2">
          <span className="text-sm text-ios-text-secondary">Кол-во слов: </span>
          <span>{dictionary.words.length}</span>
        </div>
        
        {categories.length > 0 && (
          <div>
            <span className="text-sm text-ios-text-secondary">Категории: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {categories.map(category => (
                <span 
                  key={category}
                  className="bg-ios-lightgray px-2 py-1 rounded-full text-xs"
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
        className="w-full p-3 text-ios-primary font-medium text-center"
      >
        Экспортировать словарь
      </button>
    </div>
  );
};

export default DictionaryInfo;
