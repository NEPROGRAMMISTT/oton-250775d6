
import React, { useEffect, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import TabBar from '../components/TabBar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon, Database, Trash, HardDriveDownload } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { dictionaryService } from '@/services/dictionaryService';
import { toast } from 'sonner';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [cacheInfo, setCacheInfo] = useState<{
    size: number,
    maxSize: number,
    percentage: number,
    cachedDictionaries: string[]
  }>({
    size: 0,
    maxSize: 50 * 1024 * 1024, // 50MB
    percentage: 0,
    cachedDictionaries: []
  });

  useEffect(() => {
    // Get cache info when component mounts
    const fetchCacheInfo = async () => {
      try {
        const info = await dictionaryService.getCacheInfo();
        const dictionaries = await dictionaryService.getCachedDictionaryList();
        setCacheInfo({
          ...info,
          cachedDictionaries: dictionaries
        });
      } catch (error) {
        console.error("Error getting cache info:", error);
      }
    };
    
    fetchCacheInfo();
    
    // Listen for cache updates from service worker
    const handleCacheUpdate = (event: MessageEvent) => {
      if (event.data.type === 'CACHE_SIZE_UPDATED') {
        setCacheInfo(prevInfo => ({
          ...prevInfo,
          ...event.data.payload
        }));
        
        // Update cached dictionary list
        dictionaryService.getCachedDictionaryList().then(dictionaries => {
          setCacheInfo(prevInfo => ({
            ...prevInfo,
            cachedDictionaries: dictionaries
          }));
        });
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleCacheUpdate);
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleCacheUpdate);
      }
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    try {
      const result = await dictionaryService.clearCache();
      if (result.success) {
        setCacheInfo(prevInfo => ({
          ...prevInfo,
          size: result.newSize,
          percentage: (result.newSize / cacheInfo.maxSize) * 100,
          cachedDictionaries: []
        }));
        toast.success('Кэш успешно очищен');
      } else {
        toast.error('Не удалось очистить кэш');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Произошла ошибка при очистке кэша');
    }
  };
  
  const handleImportDictionary = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        try {
          const dictionary = await dictionaryService.importDictionary(file);
          if (dictionary) {
            toast.success(`Словарь "${dictionary.info.to_language}" успешно импортирован`);
            // Update cache info
            const info = await dictionaryService.getCacheInfo();
            const dictionaries = await dictionaryService.getCachedDictionaryList();
            setCacheInfo({
              ...info,
              cachedDictionaries: dictionaries
            });
          }
        } catch (error) {
          console.error('Error importing dictionary:', error);
          toast.error('Не удалось импортировать словарь');
        }
      }
    };
    input.click();
  };

  return (
    <div className="ios-container pb-16 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
      <NavigationBar title="Настройки" />
      
      <div className="p-4 space-y-4">
        <div className="ios-card">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Внешний вид</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="text-ios-primary" size={20} />
                ) : (
                  <Sun className="text-ios-primary" size={20} />
                )}
                <Label htmlFor="theme-toggle" className="font-medium">
                  Тёмная тема
                </Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={handleToggleTheme}
              />
            </div>
          </div>
        </div>
        
        <div className="ios-card">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">Управление кэшем</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Размер кэша: {formatBytes(cacheInfo.size)} / {formatBytes(cacheInfo.maxSize)}</span>
                  <span>{cacheInfo.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${cacheInfo.percentage > 90 ? 'bg-red-600' : 'bg-ios-primary dark:bg-ios-primary-dark'}`} 
                    style={{ width: `${Math.min(cacheInfo.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Кэшированные словари ({cacheInfo.cachedDictionaries.length})</h3>
                <div className="border rounded-md overflow-hidden">
                  {cacheInfo.cachedDictionaries.length > 0 ? (
                    <ul className="divide-y">
                      {cacheInfo.cachedDictionaries.map((dict, index) => (
                        <li key={index} className="p-3 flex justify-between items-center">
                          <span>{dict}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-ios-text-secondary">
                      Нет кэшированных словарей
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleClearCache}
                  className="flex items-center"
                >
                  <Trash size={16} className="mr-1" /> Очистить кэш
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleImportDictionary}
                  className="flex items-center"
                >
                  <HardDriveDownload size={16} className="mr-1" /> Загрузить словарь
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ios-card">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-2">О приложении</h2>
            <p className="text-ios-text-secondary">
              Переводчик с поддержкой различных языков
            </p>
            <p className="text-ios-text-secondary mt-2">
              Версия: 1.0.0
            </p>
          </div>
        </div>
      </div>
      
      <TabBar />
    </div>
  );
};

export default SettingsPage;
