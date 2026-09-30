/**
 * ====================================================================
 * Oʻzbek va Rus tillari uchun maxsus ovozli sintez (TTS Engine)
 * Web Speech API uchun koʻp tilli aqlli ovoz tanlash va transliteratsiya
 * Muallif: Abubakr Muminov
 * ====================================================================
 */

/**
 * Oʻzbekcha lotin matnini kirillchaga transliteratsiya qilish.
 * Agar foydalanuvchi tizimida mahalliy oʻzbek ovozi boʻlmasa,
 * Windows/Android rus ovozlari (Irina/Pavel/Elena) kirillchadagi
 * oʻzbek soʻzlarini toʻliq tabiiy va aniq talaffuz qiladi.
 */
export function latinToUzbekCyrillic(text: string): string {
  if (!text) return '';

  let res = text;

  // Harf birikmalari (Digraflar va tutuq belgili harflar)
  const multiCharMap: [RegExp, string][] = [
    // Oʻ va Gʻ harflari (turli apostroflar bilan: ʻ ' ‘ ’ `)
    [/O[ʻ'‘’`]/g, 'Ў'],
    [/o[ʻ'‘’`]/g, 'ў'],
    [/G[ʻ'‘’`]/g, 'Ғ'],
    [/g[ʻ'‘’`]/g, 'ғ'],

    // Digraflar
    [/SH/g, 'Ш'],
    [/Sh/g, 'Ш'],
    [/sh/g, 'ш'],
    [/CH/g, 'Ч'],
    [/Ch/g, 'Ч'],
    [/ch/g, 'ч'],
    [/YO/g, 'Ё'],
    [/Yo/g, 'Ё'],
    [/yo/g, 'ё'],
    [/YU/g, 'Ю'],
    [/Yu/g, 'Ю'],
    [/yu/g, 'ю'],
    [/YA/g, 'Я'],
    [/Ya/g, 'Я'],
    [/ya/g, 'я'],
    [/YE/g, 'Е'],
    [/Ye/g, 'Е'],
    [/ye/g, 'е'],
    [/TS/g, 'Ц'],
    [/Ts/g, 'Ц'],
    [/ts/g, 'ц'],
  ];

  for (const [re, repl] of multiCharMap) {
    res = res.replace(re, repl);
  }

  // Yagona harflar jadvali
  const singleCharMap: Record<string, string> = {
    A: 'А', a: 'а',
    B: 'Б', b: 'б',
    D: 'Д', d: 'д',
    E: 'Э', e: 'е',
    F: 'Ф', f: 'ф',
    G: 'Г', g: 'г',
    H: 'Ҳ', h: 'ҳ',
    I: 'И', i: 'и',
    J: 'Ж', j: 'ж',
    K: 'К', k: 'к',
    L: 'Л', l: 'л',
    M: 'М', m: 'м',
    N: 'Н', n: 'н',
    O: 'О', o: 'о',
    P: 'П', p: 'п',
    Q: 'Қ', q: 'қ',
    R: 'Р', r: 'р',
    S: 'С', s: 'с',
    T: 'Т', t: 'т',
    U: 'У', u: 'у',
    V: 'В', v: 'в',
    X: 'Х', x: 'х',
    Y: 'Й', y: 'й',
    Z: 'З', z: 'з',
  };

  return res
    .split('')
    .map((char) => singleCharMap[char] || char)
    .join('');
}

export interface VoiceResolutionResult {
  voice: SpeechSynthesisVoice | null;
  effectiveLang: string;
  needsTransliteration: boolean;
  voiceName: string;
  description: string;
}

/**
 * Brauzerda mavjud ovozlar orasidan oʻzbek yoki rus tili uchun
 * eng mos keluvchi ovoz modelini tanlash
 */
export function resolveBestTtsVoice(
  targetLang: 'uz' | 'ru',
  voices: SpeechSynthesisVoice[],
): VoiceResolutionResult {
  if (!voices || voices.length === 0) {
    return {
      voice: null,
      effectiveLang: targetLang === 'uz' ? 'uz-UZ' : 'ru-RU',
      needsTransliteration: targetLang === 'uz',
      voiceName: 'Standart tizim ovozi',
      description: 'Tizimning asosiy ovoz moduli',
    };
  }

  // 1. Oʻzbek tili uchun ovoz qidirish
  if (targetLang === 'uz') {
    // 1.1. Asl oʻzbekcha ovoz (masalan, Microsoft Madina / Sardor / Google oʻzbek)
    const uzVoice = voices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.startsWith('uz') ||
        n.includes('uzbek') ||
        n.includes('oʻzbek') ||
        n.includes('ozbek') ||
        n.includes('madina') ||
        n.includes('sardor')
      );
    });

    if (uzVoice) {
      return {
        voice: uzVoice,
        effectiveLang: uzVoice.lang || 'uz-UZ',
        needsTransliteration: false,
        voiceName: uzVoice.name,
        description: 'Mahalliy oʻzbek ovozi (Microsoft / Google Natural)',
      };
    }

    // 1.2. Turkcha ovoz (Turkiy fonetika lotin yozuvidagi oʻzbek tiliga 95% mos keladi)
    const trVoice = voices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return l.startsWith('tr') || n.includes('turkish') || n.includes('türkçe') || n.includes('dilara') || n.includes('ahmet');
    });

    if (trVoice) {
      return {
        voice: trVoice,
        effectiveLang: trVoice.lang || 'tr-TR',
        needsTransliteration: false,
        voiceName: trVoice.name,
        description: 'Turkiy lotin fonetikasi (Turkcha nutq modeli)',
      };
    }

    // 1.3. Ruscha ovoz (Windows tizimlarida Microsoft Irina / Pavel / Elena oʻrnatilgan)
    // Rus ovozi uchun lotincha matn avtomatik ravishda oʻzbek kirillchasiga oʻgiriladi
    const ruVoice = voices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.startsWith('ru') ||
        n.includes('russian') ||
        n.includes('русский') ||
        n.includes('irina') ||
        n.includes('pavel') ||
        n.includes('elena') ||
        n.includes('dmitry') ||
        n.includes('svetlana')
      );
    });

    if (ruVoice) {
      return {
        voice: ruVoice,
        effectiveLang: 'ru-RU',
        needsTransliteration: true,
        voiceName: ruVoice.name,
        description: 'Sifatli ovoz sintezi (Kirill transliteratsiyasi bilan)',
      };
    }
  }

  // 2. Rus tili uchun ovoz qidirish
  if (targetLang === 'ru') {
    const ruVoice = voices.find((v) => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.startsWith('ru') ||
        n.includes('russian') ||
        n.includes('русский') ||
        n.includes('irina') ||
        n.includes('pavel') ||
        n.includes('elena')
      );
    });

    if (ruVoice) {
      return {
        voice: ruVoice,
        effectiveLang: ruVoice.lang || 'ru-RU',
        needsTransliteration: false,
        voiceName: ruVoice.name,
        description: 'Ruscha ovoz modeli',
      };
    }
  }

  // 3. Fallback: Hech qaysi mos kelmasa, birinchi mavjud ovozni olamiz
  const fallback = voices[0] || null;
  return {
    voice: fallback,
    effectiveLang: fallback?.lang || (targetLang === 'uz' ? 'uz-UZ' : 'ru-RU'),
    needsTransliteration: targetLang === 'uz',
    voiceName: fallback?.name || 'Tizim ovozi',
    description: 'Umumiy tizim ovozi',
  };
}

/**
 * Matnni jumlalarga ajratish (Chrome 15 soniyalik cheklovini yechish uchun)
 */
export function splitTextIntoSentences(text: string, maxChunkLength = 180): string[] {
  if (!text) return [];

  // HTML teglaridan tozalash va ortiqcha boʻshliqlarni olib tashlash
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Tinish belgilari boʻyicha ajratish (. ! ? ; va qator uzilishlari)
  const rawSentences = clean.split(/(?<=[.!?;\n])\s+/);
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChunkLength) {
      chunks.push(trimmed);
    } else {
      // Uzun jumlani vergullar yoki boʻshliqlar boʻyicha boʻlish
      const commaParts = trimmed.split(/(?<=[,])\s+/);
      let current = '';

      for (const part of commaParts) {
        if ((current + ' ' + part).trim().length <= maxChunkLength) {
          current = current ? current + ' ' + part : part;
        } else {
          if (current) chunks.push(current.trim());
          current = part;
        }
      }
      if (current) chunks.push(current.trim());
    }
  }

  return chunks.length > 0 ? chunks : [clean];
}
