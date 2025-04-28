
import React, { useState } from 'react';
import { Dictionary } from '../types/dictionary';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DictionaryInfoProps {
  dictionary: Dictionary;
  onExport: () => void;
}

const DictionaryInfo: React.FC<DictionaryInfoProps> = ({ dictionary, onExport }) => {
  const { info } = dictionary;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Handle categories properly whether it's a string or an array
  const categories = Array.isArray(info.categories) 
    ? info.categories 
    : info.categories.split(',').filter(Boolean);
  
  // Calculate pagination
  const totalWords = dictionary.words.length;
  const totalPages = Math.ceil(totalWords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = dictionary.words.slice(startIndex, endIndex);

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
          <span>{totalWords}</span>
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

        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Словарь:</h3>
          <div className="divide-y divide-ios-separator">
            {currentWords.map((word, index) => (
              <div key={index} className="py-2 flex justify-between">
                <span>{word.russian}</span>
                <span className="text-ios-primary">{word.dolgan}</span>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
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
