/** Strip HTML tags and decode basic entities into plain text. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a string contains HTML markup. */
export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Sanitize HTML produced by the Tiptap editor.
 * Strips dangerous tags, event handlers, and javascript: links.
 * Keeps: p, br, strong, em, u, s, blockquote, ul, ol, li, h2, h3, hr, code, a
 */
export function sanitizeEntryHtml(html: string): string {
  const ALLOWED =
    /^\/?(p|br|strong|em|u|s|blockquote|ul|ol|li|h2|h3|hr|code|a)(\s|\/?>|$)/i;

  return (
    html
      // Remove script/style blocks
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // Remove event handlers
      .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
      // Remove javascript: and data: URIs
      .replace(/\bjavascript\s*:/gi, "")
      .replace(/\bdata\s*:/gi, "")
      // Rewrite <a> tags — keep only safe https?:// hrefs
      .replace(
        /<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
        (_match, href: string, inner: string) => {
          const safe = /^https?:\/\//i.test(href.trim()) ? href.trim() : "#";
          return `<a href="${safe}" rel="noopener noreferrer" target="_blank">${inner}</a>`;
        },
      )
      // Strip all non-allowed tags (keep allowed ones as-is)
      .replace(/<\/?[a-z][a-z0-9]*(\s[^>]*)?\/?>/gi, (tag) => {
        const inner = tag.replace(/^<\/?/, "").replace(/\/?\s*>$/, "");
        return ALLOWED.test(inner) ? tag : ""
      })
  );
}
