interface ExportMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export class ChatExport {
  // Export chat as text
  static exportAsText(messages: ExportMessage[], religion: string, sessionTitle?: string): void {
    const title = sessionTitle || `${religion} Chat - ${new Date().toLocaleDateString()}`;

    let content = `${title}\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n`;
    content += `Religion: ${religion}\n`;
    content += `Total Messages: ${messages.length}\n`;
    content += "\n" + "=".repeat(50) + "\n\n";

    messages.forEach((message, index) => {
      const timestamp = message.timestamp.toLocaleString();
      const role = message.role === "user" ? "You" : `${religion} AI`;

      content += `[${timestamp}] ${role}:\n`;
      content += `${message.content}\n\n`;

      if (index < messages.length - 1) {
        content += "-".repeat(30) + "\n\n";
      }
    });

    this.downloadFile(content, `${title.replace(/[^a-z0-9]/gi, "_")}.txt`, "text/plain");
  }

  // Export chat as JSON
  static exportAsJSON(messages: ExportMessage[], religion: string, sessionTitle?: string): void {
    const title = sessionTitle || `${religion} Chat - ${new Date().toLocaleDateString()}`;

    const exportData = {
      title,
      religion,
      exportedAt: new Date().toISOString(),
      totalMessages: messages.length,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    };

    const content = JSON.stringify(exportData, null, 2);
    this.downloadFile(content, `${title.replace(/[^a-z0-9]/gi, "_")}.json`, "application/json");
  }

  // Export chat as Markdown
  static exportAsMarkdown(
    messages: ExportMessage[],
    religion: string,
    sessionTitle?: string
  ): void {
    const title = sessionTitle || `${religion} Chat - ${new Date().toLocaleDateString()}`;

    let content = `# ${title}\n\n`;
    content += `**Exported:** ${new Date().toLocaleString()}  \n`;
    content += `**Religion:** ${religion}  \n`;
    content += `**Total Messages:** ${messages.length}\n\n`;
    content += "---\n\n";

    messages.forEach((message, index) => {
      const timestamp = message.timestamp.toLocaleString();
      const role = message.role === "user" ? "**You**" : `**${religion} AI**`;

      content += `### ${role} - *${timestamp}*\n\n`;
      content += `${message.content}\n\n`;

      if (index < messages.length - 1) {
        content += "---\n\n";
      }
    });

    this.downloadFile(content, `${title.replace(/[^a-z0-9]/gi, "_")}.md`, "text/markdown");
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error downloading file:", error);
      // Fallback: copy to clipboard
      navigator.clipboard
        ?.writeText(content)
        .then(() => {
          alert("Export failed, but content has been copied to clipboard!");
        })
        .catch(() => {
          alert("Export failed. Please try again.");
        });
    }
  }
}
