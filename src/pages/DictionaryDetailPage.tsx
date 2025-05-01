import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import DictionaryInfo from '../components/DictionaryInfo';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { useIsMobile } from '../hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

const DictionaryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dictionary, setDictionary] = React.useState<Dictionary | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [filteredWords, setFilteredWords] = React.useState<DictionaryWord[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const wordsPerPage = 50;
  const isMobile = useIsMobile();

  // Получаем уникальные категории из словаря
  const categories = React.useMemo(() => {
    if (!dictionary) return [];
    
    const uniqueCategories = new Set<string>();
    dictionary.words.forEach(word => {
      if (word.category) {
        uniqueCategories.add(word.category);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [dictionary]);

  React.useEffect(() => {
    if (id) {
      const dictionaries = dictionaryService.getDictionaries();
      const index = parseInt(id);
      if (index >= 0 && index < dictionaries.length) {
        setDictionary(dictionaries[index]);
        // Не загружаем все слова сразу
        setFilteredWords([]);
      } else {
        navigate('/dictionaries');
      }
    }
  }, [id, navigate]);

  React.useEffect(() => {
    if (dictionary && (searchTerm.trim() !== '' || selectedCategory !== 'all')) {
      let filtered = dictionary.words;
      
      // Применяем фильтр категории
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(word => word.category === selectedCategory);
      }
      
      // Применяем поиск текста
      if (searchTerm.trim() !== '') {
        filtered = filtered.filter(word => 
          word.russian.toLowerCase().includes(searchTerm.toLowerCase()) || 
          word.dolgan.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredWords(filtered);
      setCurrentPage(1);
    } else {
      // Если нет поиска и категория all, не показываем все слова
      setFilteredWords([]);
    }
  }, [dictionary, searchTerm, selectedCategory]);

  const handleExportDictionary = () => {
    if (dictionary) {
      dictionaryService.exportDictionary(dictionary);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // Paginated words for current page
  const paginatedWords = React.useMemo(() => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    return filteredWords.slice(startIndex, endIndex);
  }, [filteredWords, currentPage, wordsPerPage]);

  // Total pages calculation
  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredWords.length / wordsPerPage);
  }, [filteredWords, wordsPerPage]);

  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  if (!dictionary) {
    return (
      <div className="ios-container">
        <NavigationBar title="Словарь" showBackButton />
        <div className="p-4 text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="ios-container pb-6 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
      <NavigationBar 
        title="Словарь" 
        showBackButton
        rightElement={
          <Link to={`/dictionary/edit/${id}`} className="text-ios-primary font-medium">
            Редактировать
          </Link>
        }
      />
      
      <div className="p-4 pt-20 space-y-4">
        <DictionaryInfo dictionary={dictionary} onExport={handleExportDictionary} />
        
        <div className="ios-card p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Поиск слов..."
                className="ios-input w-full"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm.trim() !== '' || selectedCategory !== 'all') ? (
            <>
              <div className="text-sm mb-4">
                {filteredWords.length} {filteredWords.length === 1 ? 'слово' : 
                 (filteredWords.length > 1 && filteredWords.length < 5) ? 'слова' : 'слов'} 
                {selectedCategory !== 'all' && ` в категории "${selectedCategory}"`}
                {searchTerm && ` по запросу "${searchTerm}"`}
                {filteredWords.length > wordsPerPage && ` (отображается ${paginatedWords.length} из ${filteredWords.length})`}
              </div>
              
              {filteredWords.length > 0 ? (
                <>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Слово (русский)</TableHead>
                          <TableHead>Перевод (долганский)</TableHead>
                          {selectedCategory === 'all' && <TableHead>Категория</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedWords.map((word, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{word.russian}</TableCell>
                            <TableCell className="text-ios-primary">{word.dolgan}</TableCell>
                            {selectedCategory === 'all' && <TableCell>{word.category || '-'}</TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Display first page, last page, current page and surrounding pages
                          let pageToShow;
                          if (totalPages <= 5) {
                            // Show all pages if 5 or fewer
                            pageToShow = i + 1;
                          } else if (currentPage <= 3) {
                            // Near the start
                            pageToShow = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // Near the end
                            pageToShow = totalPages - 4 + i;
                          } else {
                            // In the middle
                            pageToShow = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                isActive={currentPage === pageToShow}
                                onClick={() => goToPage(pageToShow)}
                              >
                                {pageToShow}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="text-center text-ios-text-secondary p-4">
                  Слова не найдены
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-ios-text-secondary p-4">
              Введите запрос для поиска или выберите категорию
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionaryDetailPage;
