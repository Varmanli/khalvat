export type DailyVerse = {
  text: string;
  poet?: string;
  source?: string;
  url?: string;
};

const FALLBACK_VERSES: DailyVerse[] = [
  {
    text: "الا یا ایها الساقی ادر کأساً و ناولها\nکه عشق آسان نمود اول ولی افتاد مشکل‌ها",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
  {
    text: "بشنو این نی چون شکایت می‌کند\nاز جدایی‌ها حکایت می‌کند",
    poet: "مولانا",
    source: "مثنوی معنوی",
  },
  {
    text: "گر می فروشی را منع کنم ز می خوردن\nمن خود نمی‌خورم تو را چه کار من",
    poet: "خیام",
    source: "رباعیات خیام",
  },
  {
    text: "بنی‌آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند",
    poet: "سعدی",
    source: "گلستان",
  },
  {
    text: "توانا بود هر که دانا بود\nز دانش دل پیر برنا بود",
    poet: "فردوسی",
    source: "شاهنامه",
  },
  {
    text: "هر که عاشق‌تر است بیمارتر\nوز همه بیمارتر بیمار عشق",
    poet: "مولانا",
    source: "دیوان شمس",
  },
  {
    text: "بیا که قصر امل سخت سست بنیاد است\nبیار باده که بنیاد عمر بر باد است",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
  {
    text: "گل بی‌رخ یار خوش نباشد\nبی باده بهار خوش نباشد",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
  {
    text: "اگر مسلمانی این است که حافظ دارد\nآه اگر از پس امروز بود فردایی",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
  {
    text: "صبح خیزی و سلامت طلبی چون حافظ\nهر چه کردم همه از دولت قرآن کردم",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
  {
    text: "آدمی در عالم خاکی نمی‌آید به دست\nعالمی دیگر بباید ساخت و از نو آدمی",
    poet: "اقبال لاهوری",
    source: "ارمغان حجاز",
  },
  {
    text: "سخن‌دانی و خوش‌خوانی نه این علم است و نه هنر\nحدیث از مطرب و می گو و راز دهر کمتر جو",
    poet: "حافظ",
    source: "دیوان حافظ",
  },
];

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export function getFallbackVerse(): DailyVerse {
  const idx = Math.floor(Math.random() * FALLBACK_VERSES.length);
  return FALLBACK_VERSES[idx];
}

async function fetchGanjoorPoem(
  signal?: AbortSignal,
): Promise<DailyVerse | null> {
  try {
    const res = await fetch("https://api.ganjoor.net/api/v1/poems/random", {
      signal,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();

    const verses: Array<{ text: string; versePosition: number }> =
      data?.verses ?? [];

    // Pick the first complete couplet: position 0 (right) + 1 (left)
    const right = verses.find((v) => v.versePosition === 0);
    const left = verses.find((v) => v.versePosition === 1);

    const text =
      right && left
        ? `${stripHtml(right.text)}\n${stripHtml(left.text)}`
        : right
          ? stripHtml(right.text)
          : verses[0]
            ? stripHtml(verses[0].text)
            : null;

    if (!text) return null;

    const poetName: string =
      data?.category?.poet?.nickname ??
      data?.category?.poet?.name ??
      undefined;

    const poemId: number | undefined = data?.id;
    const url = poemId
      ? `https://ganjoor.net${data?.urlSlug ?? ""}`
      : undefined;

    return {
      text,
      poet: poetName || undefined,
      source: data?.fullTitle ?? data?.title ?? undefined,
      url: url || undefined,
    };
  } catch {
    return null;
  }
}

export async function getRandomVerse(): Promise<DailyVerse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const verse = await fetchGanjoorPoem(controller.signal);
    return verse ?? getFallbackVerse();
  } finally {
    clearTimeout(timer);
  }
}

export async function getDailyVerse(): Promise<DailyVerse> {
  // Uses Next.js route-level fetch cache (revalidate: 3600 inside fetchGanjoorPoem)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const verse = await fetchGanjoorPoem(controller.signal);
    return verse ?? getFallbackVerse();
  } finally {
    clearTimeout(timer);
  }
}
