
import React from 'react';
import NavigationBar from '../components/NavigationBar';
import TabBar from '../components/TabBar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
