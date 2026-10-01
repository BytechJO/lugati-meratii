import alifImage from "figma:asset/2e7ac05d32688660f5c4551a39ee876244594961.png";
import arnabImage from "figma:asset/03193b4780b6c1663c2c79169f20584caf8b5a9c.png";
import ibraImage from "figma:asset/3a14b59d48036b9bebd2f5231af70a8fbdaea519.png";
import ustadImage from "figma:asset/216a220785407a2bc8628b1a0d3bf85089f190e1.png";
import rasImage from "figma:asset/46c822ef74d9cc21028b51d1aa52c350af43ad74.png";

import alifaudio from "../audio/حرف الالف/حرف الالف.mp3";
import arnabaudio from "../audio/حرف الالف/ارنب.mp3";
import ibraaudio from "../audio/حرف الالف/ابرة.mp3";
import ustadaudio from "../audio/حرف الالف/استاذ.mp3";
import rasaudio from "../audio/حرف الالف/فاس.mp3";

// حرف الباء
import baaImge from "../assets/حرف الباء/حرف الباء.png";
import ibraImgeBaa from "../assets/حرف الباء/ابرة.png";
import bortogalImag from "../assets/حرف الباء/برتقال.png";
import bintImg from "../assets/حرف الباء/بنت.png";
import batalImg from "../assets/حرف الباء/بطة.png";

import baaSound from "../audio/حرف الباء/حرف الباء.mp3";
import ibraSoundbaa from "../audio/حرف الباء/ابرة.mp3";
import bortogalSound from "../audio/حرف الباء/برتقال.mp3";
import bintSound from "../audio/حرف الباء/بنت.mp3";
import bataSound from "../audio/حرف الباء/بطة.mp3";

// حرف التاء

import taaImage from "../assets/حرف التاء/تاء.png";
import tofahaImage from "../assets/حرف التاء/تفاحة.png";
import tamerImage from "../assets/حرف التاء/تمر.png";
import temsahImage from "../assets/حرف التاء/تمساح.png";
import meterImage from "../assets/حرف التاء/متر.png";

import taaSound from "../audio/حرف التاء/حرف التاء.mp3";
import tofahaSound from "../audio/حرف التاء/تفاحة.mp3";
import tamerSound from "../audio/حرف التاء/تمر.mp3";
import temsahSound from "../audio/حرف التاء/تمساح.mp3";
import meterSound from "../audio/حرف التاء/متر.mp3";

export interface LetterComp {
  arabic: string;
  name: string;
  audio?: string;
  example: string;
  emoji: string;
  image?: string;
  extraImages?: { img: string; label: string; audio?: string }[];
}

export const lettersComp: LetterComp[] = [
  {
    arabic: "أ",
    name: "ألف",
    audio: alifaudio,
    example: "أسد",
    emoji: "🦁",
    image: alifImage,
    extraImages: [
      { img: arnabImage, label: "أرنب", audio: arnabaudio },
      { img: ibraImage, label: "إبرة", audio: ibraaudio },
      { img: ustadImage, label: "أستاذ", audio: ustadaudio },
      { img: rasImage, label: "رأس", audio: rasaudio },
    ],
  },
  {
    arabic: "ب",
    name: "باء",
    audio: baaSound,
    image: baaImge,
    example: "بطة",
    emoji: "🦆",
    extraImages: [
      { img: ibraImgeBaa, label: "إبرة", audio: ibraSoundbaa },
      { img: bortogalImag, label: "برتقال", audio: bortogalSound },
      { img: bintImg, label: "بنت", audio: bintSound },
      { img: batalImg, label: "بطة", audio: bataSound },
    ],
  },
  {
    arabic: "ت",
    name: "تاء",
    audio: taaSound,
    example: "تفاح",
    image: taaImage,

    emoji: "🍎",
    extraImages: [
      { img: tofahaImage, label: "تفاحة", audio: tofahaSound },
      { img: tamerImage, label: "تمر", audio: tamerSound },
      { img: temsahImage, label:"تمساح", audio: temsahSound },
      { img: meterImage, label: "متر", audio: meterSound },
    ],
  },
  { arabic: "ث", name: "ثاء", audio: "ث", example: "ثعلب", emoji: "🦊" },
  { arabic: "ج", name: "جيم", audio: "ج", example: "جمل", emoji: "🐪" },
  { arabic: "ح", name: "حاء", audio: "ح", example: "حصان", emoji: "🐴" },
  { arabic: "خ", name: "خاء", audio: "خ", example: "خروف", emoji: "🐑" },
  { arabic: "د", name: "دال", audio: "د", example: "دب", emoji: "🐻" },
  { arabic: "ذ", name: "ذال", audio: "ذ", example: "ذئب", emoji: "🐺" },
  { arabic: "ر", name: "راء", audio: "ر", example: "رمان", emoji: "🍊" },
  { arabic: "ز", name: "زاي", audio: "ز", example: "زهرة", emoji: "🌸" },
  { arabic: "س", name: "سين", audio: "س", example: "سمكة", emoji: "🐠" },
  { arabic: "ش", name: "شين", audio: "ش", example: "شمس", emoji: "☀️" },
  { arabic: "ص", name: "صاد", audio: "ص", example: "صقر", emoji: "🦅" },
  { arabic: "ض", name: "ضاد", audio: "ض", example: "ضفدع", emoji: "🐸" },
  { arabic: "ط", name: "طاء", audio: "ط", example: "طائر", emoji: "🐦" },
  { arabic: "ظ", name: "ظاء", audio: "ظ", example: "ظرف", emoji: "✉️" },
  { arabic: "ع", name: "عين", audio: "ع", example: "عصفور", emoji: "🐤" },
  { arabic: "غ", name: "غين", audio: "غ", example: "غراب", emoji: "🦅" },
  { arabic: "ف", name: "فاء", audio: "ف", example: "فيل", emoji: "🐘" },
  { arabic: "ق", name: "قاف", audio: "ق", example: "قطة", emoji: "🐱" },
  { arabic: "ك", name: "كاف", audio: "ك", example: "كلب", emoji: "🐕" },
  { arabic: "ل", name: "لام", audio: "ل", example: "ليمون", emoji: "🍋" },
  { arabic: "م", name: "ميم", audio: "م", example: "موز", emoji: "🍌" },
  { arabic: "ن", name: "نون", audio: "ن", example: "نمر", emoji: "🐯" },
  { arabic: "ه", name: "هاء", audio: "ه", example: "هدهد", emoji: "🦜" },
  { arabic: "و", name: "واو", audio: "و", example: "وردة", emoji: "🌹" },
  { arabic: "ي", name: "ياء", audio: "ي", example: "يد", emoji: "✋" },
];
