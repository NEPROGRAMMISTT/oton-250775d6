
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TranslatorPage: React.FC = () => {
  const [dictionaries, setDictionaries] = React.useState<Dictionary[]>([]);
  const [activeDictionary, setActiveDictionary] = React.useState<Dictionary | null>(null);
  const [sourceText, setSourceText] = React.useState('');
  const [results, setResults] = React.useState<DictionaryWord[]>([]);
  const [cacheInfo, setCacheInfo] = React.useState<{size: number, maxSize: number, percentage: number}>({
    size: 0,
    maxSize: 50 * 1024 * 1024, // 50MB
    percentage: 0
  });
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // Load dictionaries on component mount
    const loadDictionaries = async () => {
      const loadedDictionaries = dictionaryService.getDictionaries();
      setDictionaries(loadedDictionaries);
      if (loadedDictionaries.length > 0) {
        setActiveDictionary(loadedDictionaries[0]);
      }
      
      // Get cache info
      try {
        const info = await dictionaryService.getCacheInfo();
        setCacheInfo(info);
      } catch (error) {
        console.error("Error getting cache info:", error);
      }
    };
    
    loadDictionaries();
    
    // Listen for cache updates from service worker
    const handleCacheUpdate = (event: MessageEvent) => {
      if (event.data.type === 'CACHE_SIZE_UPDATED') {
        setCacheInfo(event.data.payload);
      }
      
      if (event.data.type === 'CACHE_LIMIT_EXCEEDED') {
        // Could show a toast notification here
        console.warn('Cache limit exceeded', event.data.payload);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleCacheUpdate);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleCacheUpdate);
    };
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

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="ios-container pb-16 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
      <NavigationBar title="Переводчик" />
      
      <div className="p-4 space-y-4">
        <div className="ios-card p-3 space-y-3">
          {/* Cache usage indicator */}
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span>Кэш: {formatBytes(cacheInfo.size)} / {formatBytes(cacheInfo.maxSize)}</span>
              <span>{cacheInfo.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${cacheInfo.percentage > 90 ? 'bg-red-600' : 'bg-ios-primary dark:bg-ios-primary-dark'}`} 
                style={{ width: `${Math.min(cacheInfo.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
          
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
