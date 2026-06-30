/**
 * Converts digits inside the text content of an HTML string to Persian digits,
 * leaving tags and their attributes (e.g. href URLs, class, style) untouched.
 * Works identically on the server and in the browser (no DOMParser dependency),
 * so it is safe to use in both server components and client components.
 */
export function persianizeHtmlText(html: string): string {
  if (!html) return html;

  // Split on tags, keeping them in the result. Even indices are text,
  // odd indices are the tags themselves (left unconverted).
  return html
    .split(/(<[^>]+>)/g)
    .map((segment, index) =>
      index % 2 === 0 ? segment.replace(/[0-9٠-٩]/g, toPersianDigit) : segment,
    )
    .join("");
}

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";

function toPersianDigit(digit: string): string {
  if (digit >= "0" && digit <= "9") {
    return PERSIAN[digit.charCodeAt(0) - 48];
  }
  const arabicIndex = ARABIC_INDIC.indexOf(digit);
  if (arabicIndex !== -1) {
    return PERSIAN[arabicIndex];
  }
  return digit;
}
