import React from "react";

// ============================================================================
// MESSAGE FORMATTING FUNCTIONS
// ============================================================================

const formatInlineText = (text: string) => {
  const elements: (string | JSX.Element)[] = [];
  let keyCounter = 0;

  const boldParts = text.split(/(\*\*[^*]+?\*\*)/g);

  boldParts.forEach((part) => {
    if (part.match(/^\*\*.*\*\*$/)) {
      const boldText = part.slice(2, -2);
      const italicParts = boldText.split(/(\*[^*]+?\*)/g);

      italicParts.forEach((italicPart) => {
        if (italicPart.match(/^\*[^*]+\*$/) && !italicPart.match(/^\*\*.*\*\*$/)) {
          const italicText = italicPart.slice(1, -1);
          elements.push(
            <span key={`bold-italic-${keyCounter++}`} className="font-bold italic text-white">
              {italicText}
            </span>
          );
        } else {
          if (italicPart) {
            elements.push(
              <span key={`bold-${keyCounter++}`} className="font-bold text-white">
                {italicPart}
              </span>
            );
          }
        }
      });
    } else {
      const italicParts = part.split(/(\*[^*]+?\*)/g);

      italicParts.forEach((italicPart) => {
        if (italicPart.match(/^\*[^*]+\*$/) && !italicPart.match(/^\*\*.*\*\*$/)) {
          const italicText = italicPart.slice(1, -1);
          elements.push(
            <span key={`italic-${keyCounter++}`} className="italic text-white/80">
              {italicText}
            </span>
          );
        } else {
          if (italicPart) {
            elements.push(italicPart);
          }
        }
      });
    }
  });

  return elements.length > 0 ? elements : [text];
};

export const formatMessageContent = (content: string) => {
  const lines = content.split(/\r?\n/);
  const elements: JSX.Element[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      elements.push(<div key={`empty-${lineIndex}`} className="h-2"></div>);
      return;
    }

    // Handle headers with ### **text** or ### 1. text
    if (trimmedLine.match(/^###\s*(\*\*.*?\*\*|[\d]+\..*)/)) {
      let headerText = "";

      // Handle ### **text** format
      const headerMatch = trimmedLine.match(/^###\s*\*\*(.*?)\*\*(.*?)$/);
      if (headerMatch) {
        headerText = headerMatch[1].trim() + (headerMatch[2] ? headerMatch[2].trim() : "");
      } else {
        // Handle ### 1. text format
        const numberMatch = trimmedLine.match(/^###\s*(.+)$/);
        if (numberMatch) {
          headerText = numberMatch[1].trim();
        }
      }

      if (headerText) {
        elements.push(
          <div key={`header-${lineIndex}`} className="mt-4 mb-3">
            <div className="text-white font-bold text-lg bg-white/10 rounded-lg px-4 py-2 border-l-4 border-white/40">
              {headerText}
            </div>
          </div>
        );
        return;
      }
    }

    // Handle numbered items ### **number. text**
    if (trimmedLine.match(/^###\s*\*\*\d+\.\s*.*\*\*/)) {
      const numberMatch = trimmedLine.match(/^###\s*\*\*(\d+\.\s*.*?)\*\*/);
      if (numberMatch) {
        const numberText = numberMatch[1].trim();
        elements.push(
          <div key={`number-${lineIndex}`} className="mt-3 mb-2">
            <div className="text-white font-bold text-base bg-white/15 rounded-lg px-3 py-2 border-l-4 border-blue-400/60">
              {numberText}
            </div>
          </div>
        );
        return;
      }
    }

    // Handle bullet points starting with -
    if (trimmedLine.match(/^\s*-\s+/)) {
      const bulletText = trimmedLine.replace(/^\s*-\s+/, "");
      const formattedBullet = formatInlineText(bulletText);
      elements.push(
        <div key={`bullet-${lineIndex}`} className="ml-4 mb-2 flex items-start">
          <span className="text-white/60 mr-3 mt-1 text-base">•</span>
          <div className="text-white/90 text-base leading-relaxed flex-1">{formattedBullet}</div>
        </div>
      );
      return;
    }

    // Handle regular text paragraphs
    const formattedLine = formatInlineText(trimmedLine);
    elements.push(
      <div key={`text-${lineIndex}`} className="mb-2">
        <div className="text-white/90 leading-relaxed text-base">{formattedLine}</div>
      </div>
    );
  });

  return elements;
};
