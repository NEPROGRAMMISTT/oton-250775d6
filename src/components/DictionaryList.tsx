import React from 'react';
import { Link } from 'react-router-dom';
import { Dictionary } from '../types/dictionary';
import { Globe } from 'lucide-react';

interface DictionaryListProps {
  dictionaries: Dictionary[];
  onDeleteDictionary: (index: number) => void;
}

const DictionaryList: React.FC<DictionaryListProps> = ({ 
  dictionaries, 
  onDeleteDictionary 
}) => {
  return (
    <div className="ios-card">
      {dictionaries.length === 0 ? (
        <div className="p-4 text-center text-ios-text-secondary dark:text-ios-text-secondary-dark">
          Нет доступных словарей
        </div>
      ) : (
        <ul>
          {dictionaries.map((dictionary, index) => (
            <li key={index} className="ios-list-item last:border-b-0 hover:bg-ios-card dark:hover:bg-ios-card-dark transition-colors duration-150">
              <Link 
                to={`/dictionary/${index}`}
                className="flex-1 flex items-center gap-3"
              >
                {dictionary.info.author === "Автоматически загружен" && (
                  <Globe size={18} className="text-ios-text dark:text-ios-text-dark" />
                )}
                <div>
                  <div className="font-medium text-ios-text dark:text-ios-text-dark">
                    {dictionary.info.from_language} → {dictionary.info.to_language}
                  </div>
                  <div className="text-sm text-ios-text-secondary dark:text-ios-text-secondary-dark">
                    {dictionary.words.length} слов
                  </div>
                </div>
              </Link>
              <button 
                onClick={() => onDeleteDictionary(index)}
                className="text-red-500 ml-4 hover:text-red-600 px-3 py-1 rounded transition-colors"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DictionaryList;