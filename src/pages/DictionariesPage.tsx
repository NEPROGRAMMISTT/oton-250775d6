import React from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import DictionaryList from '../components/DictionaryList';
import DictionaryImport from '../components/DictionaryImport';
import TabBar from '../components/TabBar';
import { Dictionary } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { toast } from '../components/ui/use-toast';
import { useIsMobile } from '../hooks/use-mobile';

const DictionariesPage: React.FC = () => {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // Load dictionaries on component mount
    loadDictionaries();
  }, []);

  const loadDictionaries = () => {
    const loadedDictionaries = dictionaryService.getDictionaries();
    setDictionaries(loadedDictionaries);
  };

  const handleDeleteDictionary = (index: number) => {
    dictionaryService.deleteDictionary(index);
    loadDictionaries();
    toast({
      title: "Словарь удален",
      description: "Словарь был успешно удален",
    });
  };

  const handleImportDictionary = async (file: File) => {
    const dictionary = await dictionaryService.importDictionary(file);
    loadDictionaries();
    return dictionary;
  };

  return (
    <div className="ios-container pb-16 pt-14 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto bg-ios-background dark:bg-ios-background-dark">
      <NavigationBar 
        title="Словари" 
        rightElement={
          <Link to="/dictionary/edit/new\" className="text-ios-text dark:text-ios-text-dark font-medium">
            Создать
          </Link>
        }
      />
      
      <div className="p-4 pt-20 space-y-4">
        <div className={`${!isMobile ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
          <div>
            <h2 className="text-lg font-medium mb-2 text-ios-text dark:text-ios-text-dark">Доступные словари</h2>
            <DictionaryList 
              dictionaries={dictionaries} 
              onDeleteDictionary={handleDeleteDictionary} 
            />
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2 text-ios-text dark:text-ios-text-dark">Импортировать словарь</h2>
            <DictionaryImport onImport={handleImportDictionary} />
          </div>
        </div>
      </div>
      
      <TabBar />
    </div>
  );
};

export default DictionariesPage;