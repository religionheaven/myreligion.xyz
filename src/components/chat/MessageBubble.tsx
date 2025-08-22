import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format message content to handle **bold** text and other markdown
  const formatMessageContent = (content: string) => {
    // Split content into lines and process each one
    const lines = content.split(/\r?\n/);
    const elements: JSX.Element[] = [];

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        elements.push(<div key={`empty-${lineIndex}`} className="h-2"></div>);
        return;
      }

      // Handle headers with ### **text**
      if (trimmedLine.match(/^###\s*\*\*.*\*\*.*$/)) {
        const headerMatch = trimmedLine.match(/^###\s*\*\*(.*?)\*\*(.*?)$/);
        if (headerMatch) {
          const headerText = headerMatch[1].trim() + (headerMatch[2] ? headerMatch[2].trim() : "");
          elements.push(
            <div key={`header-${lineIndex}`} className="mt-4 mb-3">
              <div className="text-white font-bold text-base bg-white/10 rounded-lg px-4 py-2 border-l-4 border-white/40">
                {headerText}
              </div>
            </div>
          );
          return;
        }
      }

      // Handle numbered headers like "1. **text**"
      const numberMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*(.*)$/);
      if (numberMatch) {
        const numberText = `${numberMatch[1]}. ${numberMatch[2].trim()}${numberMatch[3] ? numberMatch[3].trim() : ""}`;
        elements.push(
          <div key={`number-header-${lineIndex}`} className="mt-4 mb-3">
            <div className="text-white font-bold text-lg bg-white/15 rounded-lg px-4 py-2 border-l-4 border-blue-400/60">
              {numberText}
            </div>
          </div>
        );
        return;
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

  // Helper function to format inline text (bold, italic)
  const formatInlineText = (text: string) => {
    // Handle **bold** and *italic* text - process bold first, then italic
    const processedText = text;
    const elements: (string | JSX.Element)[] = [];
    let keyCounter = 0;

    // First pass: handle **bold** text
    const boldParts = processedText.split(/(\*\*[^*]+?\*\*)/g);

    boldParts.forEach((part, index) => {
      if (part.match(/^\*\*.*\*\*$/)) {
        // This is bold text - remove the ** and make it bold
        const boldText = part.slice(2, -2);
        // Now process this bold text for any italic formatting
        const italicParts = boldText.split(/(\*[^*]+?\*)/g);

        italicParts.forEach((italicPart, italicIndex) => {
          if (italicPart.match(/^\*[^*]+\*$/) && !italicPart.match(/^\*\*.*\*\*$/)) {
            // Bold + italic text
            const italicText = italicPart.slice(1, -1);
            elements.push(
              <span key={`bold-italic-${keyCounter++}`} className="font-bold italic text-gray-900">
                {italicText}
              </span>
            );
          } else {
            // Just bold text
            if (italicPart) {
              elements.push(
                <span key={`bold-${keyCounter++}`} className="font-bold text-gray-900">
                  {italicPart}
                </span>
              );
            }
          }
        });
      } else {
        // Not bold text - check for italic
        const italicParts = part.split(/(\*[^*]+?\*)/g);

        italicParts.forEach((italicPart, italicIndex) => {
          if (italicPart.match(/^\*[^*]+\*$/) && !italicPart.match(/^\*\*.*\*\*$/)) {
            // Just italic text
            const italicText = italicPart.slice(1, -1);
            elements.push(
              <span key={`italic-${keyCounter++}`} className="italic text-white/80">
                {italicText}
              </span>
            );
          } else {
            // Regular text
            if (italicPart) {
              elements.push(italicPart);
            }
          }
        });
      }
    });

    return elements.length > 0 ? elements : [text];
  };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-lg lg:max-w-4xl ${message.role === "user" ? "ml-12" : "mr-12"}`}
      >
        {/* Message bubble */}
        <div
          className={`px-5 py-4 rounded-2xl ${
            message.role === "user"
              ? "bg-white/90 text-black text-base"
              : "bg-black/50 text-white border border-white/30 transition-all duration-200 ease-out text-base"
          }`}
        >
          {message.role === "assistant" ? (
            <div className="leading-relaxed space-y-1">
              <div className="space-y-2">{formatMessageContent(message.content ?? "")}</div>
            </div>
          ) : (
            <p className="leading-relaxed">{message.content ?? ""}</p>
          )}
        </div>

        {/* Timestamp and actions */}
        <div
          className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-white/50 text-xs">{formatTime(message.timestamp)}</span>

          {/* Copy button for AI messages */}
          {message.role === "assistant" && (
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-white/10 transition-colors duration-200"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-white/60 hover:text-white/80" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
