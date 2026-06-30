import { sanitizeEntryHtml, isHtmlContent } from "@/lib/html-utils";
import { persianizeHtmlText } from "@/lib/html-persian-digits";

interface RenderEntryContentProps {
  content: string;
  className?: string;
}

export function RenderEntryContent({
  content,
  className = "",
}: RenderEntryContentProps) {
  if (isHtmlContent(content)) {
    return (
      <div
        className={`entry-content ${className}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: persianizeHtmlText(sanitizeEntryHtml(content)),
        }}
      />
    );
  }

  // Plain-text fallback (legacy entries)
  return (
    <div
      className={`entry-content whitespace-pre-wrap ${className}`}
    >
      {persianizeHtmlText(content)}
    </div>
  );
}
