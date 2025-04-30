
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import TranslatorInput from '../components/TranslatorInput';
import TranslationResults from '../components/TranslationResults';
import TabBar from '../components/TabBar';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowDownUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

  const handleDictionaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    if (index >= 0 && index < dictionaries.length) {
      setActiveDictionary(dictionaries[index]);
    }
  };

  const handleTranslate = (text: string, translationResults: DictionaryWord[]) => {
    setSourceText(text);
    setResults(translationResults);
  };

  return (
    <div className="ios-container pb-16 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
      <NavigationBar 
        title="Переводчик" 
        rightElement={
          <select 
            className="text-ios-primary bg-transparent border-none outline-none pr-6"
            value={dictionaries.indexOf(activeDictionary as Dictionary)}
            onChange={handleDictionaryChange}
            disabled={dictionaries.length <= 1}
          >
            {dictionaries.map((dict, index) => (
              <option key={index} value={index}>
                {dict.info.from_language} → {dict.info.to_language}
              </option>
            ))}
          </select>
        }
      />
      
      <div className="p-4 space-y-4">
        {activeDictionary && (
          <div className="ios-card p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-ios-primary font-medium">{activeDictionary.info.from_language}</div>
              <ArrowDownUp size={16} className="text-ios-text-secondary mx-2" />
              <div className="text-ios-primary font-medium">{activeDictionary.info.to_language}</div>
            </div>
          </div>
        )}
        
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
