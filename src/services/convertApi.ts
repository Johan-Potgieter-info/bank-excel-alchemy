
import { toast } from "sonner";

const CONVERT_API_KEY = "secret_gwACX7APZCZuyT88";
const API_BASE_URL = "https://v2.convertapi.com";

export interface ConversionResult {
  downloadUrl: string;
  fileName: string;
}

export class PasswordRequiredError extends Error {
  constructor() {
    super("PDF is password protected");
    this.name = "PasswordRequiredError";
  }
}

/**
 * Service to handle PDF to Excel conversions using ConvertAPI
 */
export class ConvertApiService {
  /**
   * Convert PDF file to Excel format
   * @param file PDF file to convert
   * @param password Optional password for protected PDFs
   * @param onProgress Function to handle progress updates
   */
  static async convertPdfToExcel(
    file: File,
    password?: string,
    onProgress?: (progress: number) => void
  ): Promise<ConversionResult> {
    try {
      // Start with initial progress update
      if (onProgress) onProgress(5);
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append("File", file);
      formData.append("StoreFile", "true");
      
      // Add password if provided
      if (password) {
        formData.append("Password", password);
      }
      
      if (onProgress) onProgress(15);

      // Make the API request
      const response = await fetch(
        `${API_BASE_URL}/convert/pdf/to/xlsx?Secret=${CONVERT_API_KEY}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${CONVERT_API_KEY}`
          }
        }
      );

      if (onProgress) onProgress(50);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("ConvertAPI error:", errorData);
        
        // Check if this is a password-protected PDF error
        if (errorData.Code === 5003 && errorData.Message.includes("password protected")) {
          throw new PasswordRequiredError();
        }
        
        throw new Error(`Conversion failed: ${response.status} ${response.statusText}`);
      }

      if (onProgress) onProgress(75);

      // Parse the response
      const result = await response.json();
      
      if (onProgress) onProgress(85);
      
      // Check if we have the expected response format
      if (!result.Files || result.Files.length === 0) {
        throw new Error("No converted file received from the API");
      }
      
      // Return the download URL and file name
      return {
        downloadUrl: result.Files[0].Url,
        fileName: result.Files[0].FileName || file.name.replace('.pdf', '.xlsx')
      };
    } catch (error) {
      // Check if it's a password protected error
      if (error instanceof PasswordRequiredError) {
        throw error; // Re-throw to handle in the component
      }
      
      console.error("Error in PDF conversion:", error);
      toast.error("Failed to convert PDF to Excel. Please try again.");
      throw error;
    }
  }
}
