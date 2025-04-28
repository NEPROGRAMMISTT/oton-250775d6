
import React from 'react';
import StatusBar from '../components/StatusBar';
import NavigationBar from '../components/NavigationBar';
import DictionaryList from '../components/DictionaryList';
import DictionaryImport from '../components/DictionaryImport';
import TabBar from '../components/TabBar';
import { Dictionary } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { toast } from '../components/ui/use-toast';

const DictionariesPage: React.FC = () => {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);

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
    <div className="ios-container pb-16">
      <StatusBar />
      <NavigationBar title="Словари" />
      
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-medium mb-2">Доступные словари</h2>
        
        <DictionaryList 
          dictionaries={dictionaries} 
          onDeleteDictionary={handleDeleteDictionary} 
        />
        
        <DictionaryImport onImport={handleImportDictionary} />
      </div>
      
      <TabBar />
    </div>
  );
};

export default DictionariesPage;
