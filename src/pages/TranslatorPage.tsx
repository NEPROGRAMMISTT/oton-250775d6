
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import TranslatorInput from '../components/TranslatorInput';
import TranslationResults from '../components/TranslationResults';
import TabBar from '../components/TabBar';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { useIsMobile } from '../hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TranslatorPage: React.FC = () => {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);
  const [activeDictionary, setActiveDictionary] = React.useState<Dictionary | null>(null);
  const [sourceText, setSourceText] = React.useState('');
  const [results, setResults] = React.useState<DictionaryWord[]>([]);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // Load dictionaries on component mount
    const loadDictionaries = async () => {
      const loadedDictionaries = dictionaryService.getDictionaries();
      setDictionaries(loadedDictionaries);
      if (loadedDictionaries.length > 0) {
        setActiveDictionary(loadedDictionaries[0]);
      }
    };
    
    loadDictionaries();
  }, []);

  const handleDictionaryChange = (value: string) => {
    const index = parseInt(value);
    if (index >= 0 && index < dictionaries.length) {
      setActiveDictionary(dictionaries[index]);
    }
  };

  const handleTranslate = (text: string, translationResults: DictionaryWord[]) => {
    setSourceText(text);
    setResults(translationResults);
  };

  return (
    <div className="ios-container pb-16 pt-14 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
      <NavigationBar title="Переводчик" />
      
      <div className="p-4 space-y-4">
        <div className="ios-card p-3">
          {/* Dictionary selector */}
          {activeDictionary && (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Select 
                  value={dictionaries.indexOf(activeDictionary).toString()} 
                  onValueChange={handleDictionaryChange}
                >
                  <SelectTrigger className="w-fit min-w-40">
                    <SelectValue placeholder="Выберите словарь" />
                  </SelectTrigger>
                  <SelectContent>
                    {dictionaries.map((dict, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {dict.info.from_language} → {dict.info.to_language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
          {activeDictionary ? (
            <>
              <div className={isMobile ? '' : 'col-span-1'}>
                <TranslatorInput 
                  dictionary={activeDictionary} 
                  onTranslate={handleTranslate} 
                />
              </div>
              
              <div className={isMobile ? '' : 'col-span-1'}>
                <TranslationResults 
                  sourceText={sourceText}
                  results={results}
                  fromLanguage={activeDictionary.info.from_language}
                  toLanguage={activeDictionary.info.to_language}
                />
              </div>
            </>
          ) : (
            <div className="ios-card p-4 text-center">
              <p className="text-ios-text-secondary">
                Нет доступных словарей. Пожалуйста, добавьте словарь.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <TabBar />
    </div>
  );
};

export default TranslatorPage;
