
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import NavigationBar from '../components/NavigationBar';
import { Dictionary, DictionaryWord } from '../types/dictionary';
import { dictionaryService } from '../services/dictionaryService';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from '../components/ui/use-toast';
import TabBar from '../components/TabBar';
import { useIsMobile } from '../hooks/use-mobile';

const DictionaryEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isNew = id === 'new';
  
  const [dictionary, setDictionary] = React.useState<Dictionary>({
    info: {
      author: "",
      languages: ["", ""],
      from_language: "",
      to_language: "",
      parameters: "",
      categories: "",
      social_media: {
        "Веб-сайт": ""
      }
    },
    words: []
  });
  
  const [newWord, setNewWord] = React.useState<DictionaryWord>({
    category: "",
    russian: "",
    dolgan: ""
  });

  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isNew && id) {
      const dictionaries = dictionaryService.getDictionaries();
      const index = parseInt(id);
      if (index >= 0 && index < dictionaries.length) {
        setDictionary(JSON.parse(JSON.stringify(dictionaries[index]))); // Deep copy
      } else {
        navigate('/dictionaries');
      }
    }
  }, [id, isNew, navigate]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'languages' || name === 'categories') {
      setDictionary(prev => ({
        ...prev,
        info: {
          ...prev.info,
          [name]: value.split(',').map(item => item.trim())
        }
      }));
    } else if (name.startsWith('social_media.')) {
      const key = name.split('.')[1];
      setDictionary(prev => ({
        ...prev,
        info: {
          ...prev.info,
          social_media: {
            ...prev.info.social_media,
            [key]: value
          }
        }
      }));
    } else {
      setDictionary(prev => ({
        ...prev,
        info: {
          ...prev.info,
          [name]: value
        }
      }));
    }
  };

  const handleNewWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addWord = () => {
    if (!newWord.russian || !newWord.dolgan) {
      toast({
        title: "Ошибка",
        description: "Заполните оба поля для слова",
        variant: "destructive",
      });
      return;
    }

    if (editingIndex !== null) {
      // Update existing word
      const updatedWords = [...dictionary.words];
      updatedWords[editingIndex] = newWord;
      
      setDictionary(prev => ({
        ...prev,
        words: updatedWords
      }));
      
      setEditingIndex(null);
    } else {
      // Add new word
      setDictionary(prev => ({
        ...prev,
        words: [...prev.words, newWord]
      }));
    }
    
    // Reset form
    setNewWord({
      category: "",
      russian: "",
      dolgan: ""
    });
  };

  const editWord = (index: number) => {
    setNewWord({...dictionary.words[index]});
    setEditingIndex(index);
  };

  const removeWord = (index: number) => {
    setDictionary(prev => ({
      ...prev,
      words: prev.words.filter((_, i) => i !== index)
    }));

    // If we were editing this word, reset the form
    if (editingIndex === index) {
      setNewWord({
        category: "",
        russian: "",
        dolgan: ""
      });
      setEditingIndex(null);
    }
  };

  const handleSave = () => {
    // Validation
    if (!dictionary.info.from_language || !dictionary.info.to_language) {
      toast({
        title: "Ошибка",
        description: "Укажите языки перевода",
        variant: "destructive",
      });
      return;
    }

    dictionaryService.saveDictionary(dictionary);
    toast({
      title: "Словарь сохранен",
      description: isNew ? "Новый словарь успешно создан" : "Словарь успешно обновлен",
    });
    navigate('/dictionaries');
  };

  return (
    <div className="ios-container pb-16 max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
      <StatusBar />
      <NavigationBar 
        title={isNew ? "Новый словарь" : "Редактировать словарь"} 
        showBackButton={true}
        rightElement={
          <button 
            onClick={handleSave} 
            className="text-ios-primary font-medium"
          >
            Сохранить
          </button>
        }
      />
      
      <div className="p-4 space-y-6">
        <div className="ios-card p-4">
          <h2 className="text-lg font-medium mb-4">Информация о словаре</h2>
          
          <div className={`space-y-4 ${!isMobile ? 'grid grid-cols-2 gap-4' : ''}`}>
            <div className="space-y-2">
              <Label htmlFor="author">Автор</Label>
              <Input
                id="author"
                name="author"
                value={dictionary.info.author}
                onChange={handleInfoChange}
                placeholder="Автор словаря"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="from_language">Язык оригинала</Label>
              <Input
                id="from_language"
                name="from_language"
                value={dictionary.info.from_language}
                onChange={handleInfoChange}
                placeholder="Например: Русский"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to_language">Язык перевода</Label>
              <Input
                id="to_language"
                name="to_language"
                value={dictionary.info.to_language}
                onChange={handleInfoChange}
                placeholder="Например: Английский"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="languages">Языки (через запятую)</Label>
              <Input
                id="languages"
                name="languages"
                value={dictionary.info.languages.join(', ')}
                onChange={handleInfoChange}
                placeholder="Например: russian, english"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categories">Категории (через запятую)</Label>
              <Input
                id="categories"
                name="categories"
                value={typeof dictionary.info.categories === 'string' 
                  ? dictionary.info.categories 
                  : Array.isArray(dictionary.info.categories) 
                    ? dictionary.info.categories.join(', ') 
                    : ''}
                onChange={handleInfoChange}
                placeholder="Например: бытовая лексика, приветствия"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parameters">Параметры</Label>
              <Textarea
                id="parameters"
                name="parameters"
                value={dictionary.info.parameters}
                onChange={handleInfoChange}
                placeholder="Дополнительные параметры"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="social_media.Веб-сайт">Веб-сайт</Label>
              <Input
                id="social_media.Веб-сайт"
                name="social_media.Веб-сайт"
                value={dictionary.info.social_media["Веб-сайт"]}
                onChange={handleInfoChange}
                placeholder="URL веб-сайта"
              />
            </div>
          </div>
        </div>
        
        <div className="ios-card p-4">
          <h2 className="text-lg font-medium mb-4">Словарь слов</h2>
          
          <div className="space-y-4 mb-6">
            <div className={`${!isMobile ? 'grid grid-cols-3 gap-4' : 'space-y-4'}`}>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Input
                  id="category"
                  name="category"
                  value={newWord.category}
                  onChange={handleNewWordChange}
                  placeholder="Категория слова"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="russian">Слово ({dictionary.info.from_language || "Оригинал"})</Label>
                <Input
                  id="russian"
                  name="russian"
                  value={newWord.russian}
                  onChange={handleNewWordChange}
                  placeholder="Исходное слово"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dolgan">Перевод ({dictionary.info.to_language || "Перевод"})</Label>
                <Input
                  id="dolgan"
                  name="dolgan"
                  value={newWord.dolgan}
                  onChange={handleNewWordChange}
                  placeholder="Перевод слова"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={addWord}
                className="ios-button"
              >
                {editingIndex !== null ? "Обновить слово" : "Добавить слово"}
              </button>
            </div>
          </div>
          
          {dictionary.words.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-ios-background">
                  <tr>
                    <th className="px-4 py-2 text-left">Категория</th>
                    <th className="px-4 py-2 text-left">Слово</th>
                    <th className="px-4 py-2 text-left">Перевод</th>
                    <th className="px-4 py-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {dictionary.words.map((word, index) => (
                    <tr key={index} className="border-t border-ios-separator">
                      <td className="px-4 py-2">{word.category || "-"}</td>
                      <td className="px-4 py-2 font-medium">{word.russian}</td>
                      <td className="px-4 py-2 text-ios-primary">{word.dolgan}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => editWord(index)}
                            className="text-ios-primary"
                          >
                            Правка
                          </button>
                          <button
                            onClick={() => removeWord(index)}
                            className="text-red-500"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-ios-text-secondary p-4">
              Нет слов в словаре. Добавьте новые слова.
            </div>
          )}
        </div>
      </div>
      
      <TabBar />
    </div>
  );
};

export default DictionaryEditorPage;
