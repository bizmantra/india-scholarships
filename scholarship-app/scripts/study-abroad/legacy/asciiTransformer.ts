/**
 * ASCII Transformer TypeScript Module
 */

export function parseMultiBoxFlow(block: string): string | null {
  const lines = block.split("\n").filter((l) => l.trim().length > 0);
  const topLines = lines.filter((l) => l.includes("┌"));
  if (!topLines.length) return null;
  
  const topLine = topLines[0];
  const boxRanges: { start: number; end: number }[] = [];
  let inBox = false;
  let start = -1;
  for (let i = 0; i < topLine.length; i++) {
    if (topLine[i] === "┌") {
      start = i;
      inBox = true;
    } else if (topLine[i] === "┐" && inBox) {
      boxRanges.push({ start, end: i });
      inBox = false;
    }
  }

  if (boxRanges.length < 2) return null;

  const boxes: string[][] = boxRanges.map(() => []);
  for (const line of lines) {
    if (line.includes("┌") || line.includes("└")) continue;
    boxRanges.forEach((range, idx) => {
      if (line.length > range.start) {
        const slice = line.substring(range.start, Math.min(line.length, range.end + 1));
        const clean = slice.replace(/[│─>►]/g, "").trim();
        if (clean) boxes[idx].push(clean);
      }
    });
  }

  const steps = boxes.map((linesInBox, idx) => {
    const raw = linesInBox.join(" ");
    let prefix = "Step";
    if (/stage/i.test(raw)) prefix = "Stage";
    else if (/phase/i.test(raw)) prefix = "Phase";
    else if (/tier/i.test(raw)) prefix = "Tier";
    else if (/type/i.test(raw)) prefix = "Type";
    else if (/pathway/i.test(raw)) prefix = "Pathway";
    
    const title = raw.replace(/(?:STEP|STAGE|PHASE|TIER|TYPE|PATHWAY)\s*\d+:?/i, "").trim();
    return `${idx + 1}. **${prefix} ${idx + 1}**: ${title}`;
  });

  return "\n\n" + steps.join("\n") + "\n\n";
}

export function convertTreeToTable(block: string): string | null {
  const lines = block.split("\n").filter((l) => l.trim().length > 0);
  const arrowLineIdx = lines.findIndex((l) => l.includes("▼"));
  if (arrowLineIdx === -1) return null;

  const contentLines = lines.slice(arrowLineIdx + 1);
  const rows: string[][] = [];

  for (const line of contentLines) {
    const parts = line.split(/\s{3,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      rows.push(parts);
    }
  }

  if (rows.length < 2) return null;

  const maxCols = Math.max(...rows.map((r) => r.length));
  const normRows = rows.map((r) => {
    const copy = [...r];
    while (copy.length < maxCols) copy.push("");
    return copy;
  });

  let mdTable = "\n\n| " + normRows[0].join(" | ") + " |\n";
  mdTable += "| " + normRows[0].map(() => "---").join(" | ") + " |\n";
  for (let i = 1; i < normRows.length; i++) {
    mdTable += "| " + normRows[i].join(" | ") + " |\n";
  }
  return mdTable + "\n\n";
}

export function convertAsciiTable(block: string): string | null {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows: string[][] = [];
  let tableTitle = "";

  for (const line of lines) {
    if (/^[┌├└]/.test(line)) continue;
    if (line.startsWith("│") && line.endsWith("│")) {
      const cells = line.slice(1, -1).split("│").map((c) => c.trim());
      if (cells.length === 1 && rows.length === 0) {
        tableTitle = cells[0].replace(/\*+/g, "").trim();
        continue;
      }
      if (cells.length >= 2) {
        rows.push(cells);
      }
    }
  }

  if (rows.length >= 2) {
    const maxCols = Math.max(...rows.map((r) => r.length));
    const normRows = rows.map((r) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push("");
      return copy;
    });

    let mdTable = "\n\n";
    if (tableTitle) mdTable += `**${tableTitle}**\n\n`;
    mdTable += "| " + normRows[0].join(" | ") + " |\n";
    mdTable += "| " + normRows[0].map(() => "---").join(" | ") + " |\n";
    for (let i = 1; i < normRows.length; i++) {
      mdTable += "| " + normRows[i].join(" | ") + " |\n";
    }
    return mdTable + "\n\n";
  }
  return null;
}

export function convertSingleColumnCallout(block: string): string | null {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.some((l) => l.includes("┌")) || !lines.some((l) => l.includes("│"))) return null;

  let title = "";
  const bodyItems: string[] = [];

  for (const line of lines) {
    if (/^[┌├└]/.test(line)) continue;
    if (line.startsWith("│") && line.endsWith("│")) {
      const content = line.slice(1, -1).trim();
      if (!content) continue;
      if (!title && !bodyItems.length && !content.toLowerCase().startsWith("step") && !content.toLowerCase().startsWith("stage") && !content.toLowerCase().startsWith("month") && !content.toLowerCase().startsWith("bad") && !content.toLowerCase().startsWith("good")) {
        title = content.replace(/\*+/g, "").trim();
      } else {
        bodyItems.push(content);
      }
    }
  }

  if (bodyItems.length >= 1) {
    let out = "\n\n";
    if (title) out += `> ### 📋 ${title}\n`;
    bodyItems.forEach((item) => {
      out += `> * ${item}\n`;
    });
    return out + "\n\n";
  }
  return null;
}

export function convertAsciiTablesAndSteps(content: string): string {
  if (!content) return "";
  const regex = /```(?:text|ascii)?\s*\n([\s\S]*?)```/g;
  return content.replace(regex, (match, block) => {
    if (!block.includes("┌") && !block.includes("│") && !block.includes("└") && !block.includes("▼")) {
      return match;
    }

    // 1. Multi-box flowchart first
    const flowResult = parseMultiBoxFlow(block);
    if (flowResult) return flowResult;

    // 2. Tree comparison diagram
    const treeResult = convertTreeToTable(block);
    if (treeResult) return treeResult;

    // 3. Multi-column Table conversion
    const tableResult = convertAsciiTable(block);
    if (tableResult) return tableResult;

    // 4. Single-column Callout conversion
    const calloutResult = convertSingleColumnCallout(block);
    if (calloutResult) return calloutResult;

    return match;
  });
}
