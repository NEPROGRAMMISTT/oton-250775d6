
import React, { useRef } from 'react';
import { Dictionary } from '../types/dictionary';
import { toast } from '../components/ui/use-toast';

interface DictionaryImportProps {
  onImport: (file: File) => Promise<Dictionary | null>;
}

const DictionaryImport: React.FC<DictionaryImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        const dictionary = await onImport(file);
        if (dictionary) {
          toast({
            title: "Импорт успешно завершен",
            description: `Словарь ${dictionary.info.from_language} → ${dictionary.info.to_language} импортирован`,
          });
        }
      } catch (error) {
        toast({
          title: "Ошибка импорта",
          description: "Не удалось импортировать словарь. Проверьте формат файла.",
          variant: "destructive",
        });
      }
      
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mt-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={handleImportClick}
        className="ios-button w-full"
      >
        Импортировать словарь
      </button>
    </div>
  );
};

export default DictionaryImport;
