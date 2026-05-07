import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

export async function downloadAsWord(text: string, filename: string = "extracted_content.docx") {
  const lines = text.split("\n");
  const children: (Paragraph | Table)[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if it's a table start (Markdown format)
    if (line.startsWith("|") && i + 1 < lines.length && lines[i+1].includes("|---")) {
      const tableRows: TableRow[] = [];
      
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        const rowText = lines[j].trim();
        
        // Skip separator rows
        if (rowText.includes("|---")) {
          j++;
          continue;
        }

        const cells = rowText
          .split("|")
          .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map(cell => cell.trim());

        if (cells.length > 0) {
          tableRows.push(
            new TableRow({
              children: cells.map(cell => 
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          font: "Khmer OS",
                          size: 20,
                        })
                      ],
                    })
                  ],
                  width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
                })
              ),
            })
          );
        }
        j++;
      }

      if (tableRows.length > 0) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
          })
        );
        children.push(new Paragraph({ children: [] }));
      }
      i = j;
    } else {
      if (line !== "") {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: "Khmer OS",
                size: 24,
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
      } else {
        children.push(new Paragraph({ spacing: { after: 100 } }));
      }
      i++;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export function downloadAsLaTeX(text: string, filename: string = "extracted_content.tex") {
  // Advanced LaTeX template with Khmer support (requires XeLaTeX or LuaLaTeX)
  // To compile on Overleaf: Select "Menu" -> "Compiler" -> "XeLaTeX"
  const latexTemplate = `% !TEX program = xelatex
\\documentclass[12pt, a4paper]{article}

% --- Essential Packages ---
\\usepackage{fontspec}
\\usepackage{polyglossia}
\\usepackage{amsmath, amssymb, amsfonts, amsthm}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{enumitem}
\\usepackage{multicol}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{tabularx}
\\usepackage{longtable}
\\usepackage[hidelinks]{hyperref}

% --- Document Layout ---
\\geometry{
  a4paper,
  left=2.5cm,
  right=2cm,
  top=2.5cm,
  bottom=2.5cm
}

% --- Language & Font Setup ---
\\setmainlanguage{khmer}
\\setotherlanguage{english}

% Use common Khmer fonts available on Overleaf (Noto Sans Khmer)
\\newfontfamily\\khmerfont{Noto Sans Khmer}[Script=Khmer, Scale=1.0]
\\newfontfamily\\khmerfontsf{Noto Sans Khmer}[Script=Khmer, Scale=1.0]

\\onehalfspacing

\\begin{document}
\\raggedright % Better for Khmer text alignment
${text}
\\end{document}
`;

  const blob = new Blob([latexTemplate], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}
