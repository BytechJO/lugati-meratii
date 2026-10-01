import alifCard from "../assets/الحروف/حرف الالف.svg";
import baaCard from "../assets/الحروف/حرف الباء.svg";
import taaCard from "../assets/الحروف/حرف التاء.svg";
import thaaCard from "../assets/الحروف/حرف الثاء.svg";
import jeemCard from "../assets/الحروف/حرف الجيم.svg";
import haaCard from "../assets/الحروف/حرف الحاء.svg";
import khaaCard from "../assets/الحروف/حرف الخاء.svg";
import dalCard from "../assets/الحروف/حرف الدال.svg";
import dhalCard from "../assets/الحروف/حرف الذال.svg";
import raaCard from "../assets/الحروف/حرف الراء.svg";
import zayCard from "../assets/الحروف/حرف الزاي.svg";
import seenCard from "../assets/الحروف/حرف السين.svg";
import sheenCard from "../assets/الحروف/حرف الشين.svg";
import sadCard from "../assets/الحروف/حرف الصاد.svg";
import dadCard from "../assets/الحروف/حرف الضاد.svg";
import taaMufakhamaCard from "../assets/الحروف/حرف الطاء.svg";
import dhaaCard from "../assets/الحروف/حرف الظاد.svg";
import ainCard from "../assets/الحروف/حرف العين.svg";
import ghainCard from "../assets/الحروف/حرف الغين.svg";
import faaCard from "../assets/الحروف/حرف الفاء.svg";
import qafCard from "../assets/الحروف/حرف القاف.svg";
import kafCard from "../assets/الحروف/حرف الكاف.svg";
import lamCard from "../assets/الحروف/حرف اللام.svg";
import meemCard from "../assets/الحروف/حرف الميم.svg";
import noonCard from "../assets/الحروف/حرف النون.svg";
import haaMarbutaCard from "../assets/الحروف/حرف الهاء.svg";
import wawCard from "../assets/الحروف/حرف الواو.svg";
import yaaCard from "../assets/الحروف/حرف الياء.svg";
// ... استورد صورة كل حرف عندك

export interface LetterCard {
  letter: string;
  name: string;
  image: string;
}

export const letterCards: LetterCard[] = [
  { letter: "أ", name: "ألف", image: alifCard },
  { letter: "ب", name: "باء", image: baaCard },
  { letter: "ت", name: "تاء", image: taaCard },
  { letter: "ث", name: "ثاء", image: thaaCard },
  { letter: "ج", name: "جيم", image: jeemCard },
  { letter: "ح", name: "حاء", image: haaCard },
  { letter: "خ", name: "خاء", image: khaaCard },
  { letter: "د", name: "دال", image: dalCard },
  { letter: "ذ", name: "ذال", image: dhalCard },
  { letter: "ر", name: "راء", image: raaCard },
  { letter: "ز", name: "زاي", image: zayCard },
  { letter: "س", name: "سين", image: seenCard },
  { letter: "ش", name: "شين", image: sheenCard },
  { letter: "ص", name: "صاد", image: sadCard },
  { letter: "ض", name: "ضاد", image: dadCard },
  { letter: "ط", name: "طاء", image: taaMufakhamaCard },
  { letter: "ظ", name: "ظاء", image: dhaaCard },
  { letter: "ع", name: "عين", image: ainCard },
  { letter: "غ", name: "غين", image: ghainCard },
  { letter: "ف", name: "فاء", image: faaCard },
  { letter: "ق", name: "قاف", image: qafCard },
  { letter: "ك", name: "كاف", image: kafCard },
  { letter: "ل", name: "لام", image: lamCard },
  { letter: "م", name: "ميم", image: meemCard },
  { letter: "ن", name: "نون", image: noonCard },
  { letter: "ه", name: "هاء", image: haaMarbutaCard },
  { letter: "و", name: "واو", image: wawCard },
  { letter: "ي", name: "ياء", image: yaaCard },
];
