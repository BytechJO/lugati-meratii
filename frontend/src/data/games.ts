import wordCatch from "../assets/wordCatch.png";
import sortWord from "../assets/wordMatch.png";
import wordMatch from "../assets/sorting.png";
import balloon from "../assets/balloon2.png";
import type { GameCardData } from "../types/games";

export function getGameCards(letterName: string): GameCardData[] {
  return [
    {
      id: "word_catch",
      title: `اصطد كلمات ال${letterName}`,
      description: `اصطد الكلمات التي تبدأ بحرف ال${letterName} قبل أن تختفي `,
      icon: wordCatch,    },
    {
      id: "sorting",
      title: `صنف كلمات ال${letterName}`,
      description: `اسحب الكلمات للمكان الصحيح: ${letterName} أم حروف أخرى`,
      icon: wordMatch,    },
    {
      id: "memory_match",
      title: `ذاكرة ال${letterName}`,
      description: `اقلب البطاقات وطابق حرف ال${letterName} مع الكلمات`,
      icon: sortWord,    },
    {
      id: "balloon_pop",
      title: `بالونات ال${letterName}`,
      description: ` افرقع البالونات التي تحتوي على كلمات تبدأ ب ${letterName}`,
      icon: balloon,    },
  ];
}
