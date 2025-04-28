
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import NavigationBar from '../components/NavigationBar';
import DictionaryInfo from '../components/DictionaryInfo';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';

const DictionaryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dictionary, setDictionary] = React.useState<Dictionary | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredWords, setFilteredWords] = React.useState<DictionaryWord[]>([]);

  React.useEffect(() => {
    if (id) {
      const dictionaries = dictionaryService.getDictionaries();
      const index = parseInt(id);
      if (index >= 0 && index < dictionaries.length) {
        setDictionary(dictionaries[index]);
        setFilteredWords(dictionaries[index].words);
      } else {
        navigate('/dictionaries');
      }
    }
  }, [id, navigate]);

  const handleExportDictionary = () => {
    if (dictionary) {
      dictionaryService.exportDictionary(dictionary);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (dictionary) {
      if (term.trim() === '') {
        setFilteredWords(dictionary.words);
      } else {
        const filtered = dictionary.words.filter(word => 
          word.russian.toLowerCase().includes(term.toLowerCase()) || 
          word.dolgan.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredWords(filtered);
      }
    }
  };

  // Group words by category for display
  const wordsByCategory = React.useMemo(() => {
    if (!filteredWords.length) return {};
    
    return filteredWords.reduce((acc: Record<string, DictionaryWord[]>, word) => {
      const category = word.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(word);
      return acc;
    }, {});
  }, [filteredWords]);

  if (!dictionary) {
    return (
      <div className="ios-container">
        <StatusBar />
        <NavigationBar title="Словарь" showBackButton />
        <div className="p-4 text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="ios-container pb-6">
      <StatusBar />
      <NavigationBar title="Словарь" showBackButton />
      
      <div className="p-4 space-y-4">
        <DictionaryInfo dictionary={dictionary} onExport={handleExportDictionary} />
        
        <div className="ios-card p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Поиск слов..."
            className="ios-input mb-4"
          />
          
          <div className="text-sm mb-2">
            {filteredWords.length} из {dictionary.words.length} слов
          </div>
          
          {Object.entries(wordsByCategory).map(([category, words]) => (
            <div key={category} className="mb-4">
              <div className="ios-section-header">{category}</div>
              <div className="ios-card overflow-hidden">
                {words.map((word, index) => (
                  <div key={index} className="ios-list-item last:border-b-0">
                    <div className="font-medium">{word.russian}</div>
                    <div className="text-ios-primary">{word.dolgan}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredWords.length === 0 && (
            <div className="text-center text-ios-text-secondary p-4">
              Слова не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionaryDetailPage;
