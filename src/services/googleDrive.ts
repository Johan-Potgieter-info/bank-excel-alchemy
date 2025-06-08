
import { toast } from "sonner";

// This is the folder ID from the provided Google Drive link
const GOOGLE_DRIVE_FOLDER_ID = "1Dh9qpol-pEYj0BzT4EicdajGGZcx3Syr";

/**
 * Service to handle Google Drive operations
 */
export class GoogleDriveService {
  private static serviceAccountKey: string | null = null;
  private static serviceAccountEmail = "jojo-pdf-to-excel@pdf-to-excel-api.iam.gserviceaccount.com";

  /**
   * Initialize Google Drive API with the provided credentials
   * @param serviceAccountKey JSON key for the service account
   */
  static initialize(serviceAccountKey: string): void {
    try {
      // Store the raw JSON key for later use by the backend
      this.serviceAccountKey = serviceAccountKey;
      console.log(
        "Google Drive service initialized with service account:",
        this.serviceAccountEmail
      );

      // Persist initialization state
      localStorage.setItem("gdrive_initialized", "true");
      localStorage.setItem("gdrive_key", serviceAccountKey);

      toast.success("Google Drive service connected", {
        description: "Your files will be saved to your shared folder",
      });
    } catch (error) {
      console.error("Failed to initialize Google Drive service:", error);
      localStorage.removeItem("gdrive_initialized");
      localStorage.removeItem("gdrive_key");
      this.serviceAccountKey = null;
      toast.error("Failed to connect to Google Drive");
      throw error;
    }
  }

  /**
   * Upload a file to Google Drive
   * @param fileUrl URL of the file to upload
   * @param fileName Name for the file in Google Drive
   * @param onProgress Function to handle progress updates
   */
  static async uploadFile(
    fileUrl: string,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Check if the service is initialized
      if (!this.serviceAccountKey && !localStorage.getItem('gdrive_initialized')) {
        throw new Error("Google Drive service not initialized");
      }

      // Set API key from localStorage if needed
      if (!this.serviceAccountKey && localStorage.getItem('gdrive_key')) {
        this.serviceAccountKey = localStorage.getItem('gdrive_key');
      }

      if (onProgress) onProgress(90);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileUrl,
          fileName,
          serviceAccountKey: this.serviceAccountKey
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();

      if (onProgress) onProgress(100);

      const driveUrl = data.webViewLink;
      console.log(`File "${fileName}" uploaded to Google Drive folder: ${GOOGLE_DRIVE_FOLDER_ID}`);
      return driveUrl;
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      toast.error("Failed to upload file to Google Drive");
      throw error;
    }
  }

  /**
   * Check if the service account has access to the folder
   */
  static async checkFolderAccess(): Promise<boolean> {
    try {
      // Check localStorage first
      if (localStorage.getItem('gdrive_initialized')) {
        this.serviceAccountKey = localStorage.getItem('gdrive_key');
        return true;
      }

      // In a real implementation, you would make an API call to check access
      return !!this.serviceAccountKey;
    } catch (error) {
      console.error("Error checking folder access:", error);
      return false;
    }
  }
}
