import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../API/axios";
import { getGameCards } from "../../data/games";
import { useAppSelector } from "../../redux/hooks";
import type { GameType } from "../../types/games";
import background from "../../assets/background-learnLetter.svg";

interface PreviewConfig {
  title?: string;
  instruction?: string;
  correctWords?: string[];
  wrongWords?: string[];
  items?: { word: string; startsWithTarget: boolean }[];
  words?: { word: string; startsWithTarget: boolean }[];
  pairs?: { letter: string; word: string }[];
}

export function GamePreview({ gameType }: { gameType: GameType }) {
  const { letter } = useParams();
  const letters = useAppSelector((state) => state.letters.letters);
  const letterName = letters.find((item) => item.symbol === letter)?.name ?? letter ?? "";
  const card = getGameCards(letterName).find((item) => item.id === gameType)!;
  const [state, setState] = useState<{ config?: PreviewConfig; error?: string }>({});

  useEffect(() => {
    const controller = new AbortController();
    setState({});
    api.get("/lessons/games-lessons/by-letter-and-type", {
      params: { letter, gameType }, signal: controller.signal,
    }).then((response) => {
      if (controller.signal.aborted) return;
      const config = response.data?.data?.data;
      setState(config ? { config } : { error: "لا يوجد محتوى لهذه اللعبة حالياً." });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ error: "تعذر تحميل معاينة اللعبة. ارجع إلى قائمة الألعاب وحاول مجدداً." });
    });
    return () => controller.abort();
  }, [letter, gameType]);

  const config = state.config;
  const items = config?.items ?? config?.words;
  const correctWords = config?.correctWords ?? items?.filter((item) => item.startsWithTarget).map((item) => item.word) ?? [];
  const wrongWords = config?.wrongWords ?? items?.filter((item) => !item.startsWithTarget).map((item) => item.word) ?? [];

  return (
    <main dir="rtl" className="min-h-screen px-6 py-8 font-tajawal" style={{ backgroundImage: `url(${background})`, backgroundSize: "cover", color: "#652b82" }}>
      <div className="max-w-4xl mx-auto">
        <Link to={`/letter/${letter}/games`} className="inline-block rounded-full bg-white px-6 py-3 mb-6">العودة إلى الألعاب</Link>
        <section className="rounded-3xl bg-white p-6 md:p-10 shadow-lg">
          <p className="font-bold mb-3" role="note">معاينة للمعلم فقط — اللعب متاح للطلاب</p>
          <h1 className="text-3xl font-bold mb-4">{config?.title ?? card.title}</h1>
          <p className="text-xl mb-6">{config?.instruction ?? card.description}</p>
          <img src={card.icon} alt={`صورة توضيحية: ${card.title}`} className="w-full max-w-md mx-auto rounded-3xl mb-6" />
          {!config && <p role="status">{state.error ?? "جارٍ تحميل محتوى اللعبة…"}</p>}
          {config?.pairs ? (
            <div>
              <h2 className="text-xl font-bold mb-3">أزواج المطابقة</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.pairs.map((pair, index) => <li key={index} className="rounded-2xl bg-purple-50 p-4 text-xl">{pair.letter} — {pair.word}</li>)}
              </ul>
            </div>
          ) : config && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[{ title: "الكلمات التي تبدأ بالحرف", words: correctWords }, { title: "كلمات الحروف الأخرى", words: wrongWords }].map((group) => (
                <div key={group.title}>
                  <h2 className="text-xl font-bold mb-3">{group.title}</h2>
                  <ul className="flex flex-wrap gap-3">{group.words.map((word, index) => <li key={index} className="rounded-2xl bg-purple-50 px-4 py-3 text-xl">{word}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
