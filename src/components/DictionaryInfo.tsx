
import React, { useState } from 'react';
import { Dictionary } from '../types/dictionary';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

interface DictionaryInfoProps {
  dictionary: Dictionary;
  onExport: () => void;
}

const DictionaryInfo: React.FC<DictionaryInfoProps> = ({ dictionary, onExport }) => {
  const { info } = dictionary;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Changed from 10 to 50 words per page
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle categories properly whether it's a string or an array
  const categories = Array.isArray(info.categories) 
    ? info.categories 
    : info.categories.split(',').filter(Boolean);
  
  // Filter words based on search query
  const filteredWords = searchQuery.trim() === ''
    ? dictionary.words
    : dictionary.words.filter(word =>
        word.russian.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.dolgan.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  // Calculate pagination
  const totalWords = filteredWords.length;
  const totalPages = Math.ceil(totalWords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    
    // Maximum number of page links to show
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page if not included
    if (startPage > 1) {
      items.push(
        <PaginationItem key="page-1">
          <PaginationLink onClick={() => goToPage(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Add ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <span className="px-2">...</span>
          </PaginationItem>
        );
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => goToPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add last page if not included
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <span className="px-2">...</span>
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink onClick={() => goToPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

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
          <div className="mb-4">
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
          
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              placeholder="Поиск слов..."
              className="ios-input w-full"
            />
          </div>
          
          {totalWords > 0 ? (
            <>
              <div className="text-sm text-ios-text-secondary mb-2">
                Показано {Math.min(startIndex + 1, totalWords)}-{Math.min(endIndex, totalWords)} из {totalWords} слов
              </div>
              
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
                          onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {getPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-ios-text-secondary">
              Слова не найдены
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
