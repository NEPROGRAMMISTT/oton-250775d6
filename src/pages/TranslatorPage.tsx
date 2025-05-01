
import React from 'react';
import StatusBar from '../components/StatusBar';
import NavigationBar from '../components/NavigationBar';
import TranslatorInput from '../components/TranslatorInput';
import TranslationResults from '../components/TranslationResults';
import TabBar from '../components/TabBar';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';

const TranslatorPage: React.FC = () => {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);
  const [activeDictionary, setActiveDictionary] = React.useState<Dictionary | null>(null);
  const [sourceText, setSourceText] = React.useState('');
  const [results, setResults] = React.useState<DictionaryWord[]>([]);

  React.useEffect(() => {
    // Load dictionaries on component mount
    const loadedDictionaries = dictionaryService.getDictionaries();
    setDictionaries(loadedDictionaries);
    if (loadedDictionaries.length > 0) {
      setActiveDictionary(loadedDictionaries[0]);
    }
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
    <div className="ios-container pb-16">
      <StatusBar />
      <NavigationBar 
        title="Переводчик" 
        rightElement={
          <select 
            className="text-ios-primary bg-transparent border-none outline-none"
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
        {activeDictionary ? (
          <>
            <TranslatorInput 
              dictionary={activeDictionary} 
              onTranslate={handleTranslate} 
            />
            
            <TranslationResults 
              sourceText={sourceText}
              results={results}
              fromLanguage={activeDictionary.info.from_language}
              toLanguage={activeDictionary.info.to_language}
            />
          </>
        ) : (
          <div className="ios-card p-4 text-center">
            <p className="text-ios-text-secondary">
              Нет доступных словарей. Пожалуйста, добавьте словарь.
            </p>
          </div>
        )}
      </div>
      
      <TabBar />
    </div>
  );
};

export default TranslatorPage;
