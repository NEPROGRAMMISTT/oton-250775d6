import React, { useEffect, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import TabBar from '../components/TabBar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon, HardDriveDownload } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { dictionaryService } from '../services/dictionaryService';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
    <div className="ios-container pb-16 pt-14 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto bg-ios-background dark:bg-ios-background-dark">
      <NavigationBar title="Настройки" />
      
      <div className="p-4 space-y-4">
        <div className="ios-card">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4 text-ios-text dark:text-ios-text-dark">Внешний вид</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="text-ios-text dark:text-ios-text-dark" size={20} />
                ) : (
                  <Sun className="text-ios-text dark:text-ios-text-dark" size={20} />
                )}
                <Label htmlFor="theme-toggle" className="font-medium text-ios-text dark:text-ios-text-dark">
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
            <h2 className="text-lg font-medium mb-4 text-ios-text dark:text-ios-text-dark">Управление словарями</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
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
            <h2 className="text-lg font-medium mb-2 text-ios-text dark:text-ios-text-dark">О приложении</h2>
            <p className="text-ios-text-secondary dark:text-ios-text-secondary-dark">
              Переводчик с поддержкой различных языков
            </p>
            <p className="text-ios-text-secondary dark:text-ios-text-secondary-dark mt-2">
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