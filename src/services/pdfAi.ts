import { toast } from "sonner";
import { getDocument, GlobalWorkerOptions, version as pdfjsVersion } from "pdfjs-dist";
import * as XLSX from "xlsx";
import { ConversionResult } from "./convertApi";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/**
 * Service for converting PDFs to Excel using AI extraction
 */
export class PdfAiService {
  /** Extract text from a PDF file */
  static async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += (content.items as any[]).map((it: any) => it.str).join(" ") + "\n";
      }
      return text;
    } catch (error) {
      console.error("Failed to extract text from PDF:", error);
      toast.error("Failed to read PDF file");
      throw error;
    }
  }

  /** Send extracted text to the AI API to get structured JSON */
  static async sendToAiApi(text: string): Promise<any> {
    try {
      const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Parse the following bank statement text and return an array of objects with fields Date, Description, Amount, Balance in JSON format.",
            },
            { role: "user", content: text },
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }
      const result = await response.json();
      return JSON.parse(result.choices[0].message.content);
    } catch (error) {
      console.error("AI API error:", error);
      toast.error("Failed to analyze PDF with AI");
      throw error;
    }
  }

  /** Convert a JSON object to an Excel download URL */
  static jsonToExcel(data: any): string {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return URL.createObjectURL(blob);
  }

  /**
   * Convert PDF to Excel using AI parsing
   */
  static async convertPdfToExcel(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ConversionResult> {
    try {
      if (onProgress) onProgress(5);
      const text = await this.extractText(file);
      if (onProgress) onProgress(40);
      const json = await this.sendToAiApi(text);
      if (onProgress) onProgress(70);
      const downloadUrl = this.jsonToExcel(json);
      if (onProgress) onProgress(100);
      return {
        downloadUrl,
        fileName: file.name.replace(/\.pdf$/i, ".xlsx"),
      };
    } catch (error) {
      console.error("AI conversion failed:", error);
      throw error;
    }
  }
}
