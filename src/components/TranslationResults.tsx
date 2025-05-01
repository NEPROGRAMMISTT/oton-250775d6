
import React from 'react';
import { DictionaryWord } from '../types/dictionary';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

interface TranslationResultsProps {
  sourceText: string;
  results: DictionaryWord[];
  fromLanguage: string;
  toLanguage: string;
}

const TranslationResults: React.FC<TranslationResultsProps> = ({
  sourceText,
  results,
  fromLanguage,
  toLanguage
}) => {
  const [showDictionary, setShowDictionary] = React.useState(true);
  
  // Generate the full translated text
  const translatedText = React.useMemo(() => {
    return results.map(word => word.dolgan).join('');
  }, [results]);

  // Group results by category for detailed view
  const resultsByCategory = React.useMemo(() => {
    return results.filter(word => word.category !== 'formatting').reduce((acc: Record<string, DictionaryWord[]>, word) => {
      const category = word.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      // Only add unique words to each category
      if (!acc[category].some(w => w.russian === word.russian)) {
        acc[category].push(word);
      }
      return acc;
    }, {});
  }, [results]);

  return (
    <div className="ios-card overflow-hidden">
      <div className="flex justify-between px-4 py-3 border-b border-ios-separator">
        <div className="font-medium">{fromLanguage}</div>
        <div className="font-medium">{toLanguage}</div>
      </div>
      
      {results.length === 0 ? (
        <div className="p-4 text-center text-ios-text-secondary">
          {sourceText ? 'Перевод не найден' : 'Введите текст для перевода'}
        </div>
      ) : (
        <div>
          {/* Full translation display */}
          <div className="p-4 border-b border-ios-separator">
            <h3 className="font-medium mb-2">Полный перевод:</h3>
            <div className="bg-ios-background p-3 rounded-lg whitespace-pre-wrap break-words">
              {translatedText}
            </div>
          </div>
          
          {/* Dictionary section with toggle */}
          <div>
            <div className="flex justify-between items-center px-4 pt-3 pb-1">
              <h3 className="font-medium">Словарь:</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDictionary(!showDictionary)}
                className="h-8 w-8"
              >
                {showDictionary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {showDictionary && Object.entries(resultsByCategory).map(([category, words]) => (
              <div key={category}>
                <div className="ios-section-header">{category}</div>
                {words.map((word, index) => (
                  <div key={index} className="ios-list-item last:border-b-0">
                    <div className="font-medium">{word.russian}</div>
                    <div className="text-ios-primary">{word.dolgan}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationResults;
