import { fileTypeFromBuffer } from "file-type";

/**
 * Detects MIME type from a file buffer
 * @param {Buffer} buffer - The file buffer to analyze
 * @returns {string} - The detected MIME type or a default one
 */
export async function detectMimeType(buffer) {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    if (fileType) {
      return fileType.mime;
    }
    // Fallback to octet-stream for unknown binary files
    return "application/octet-stream";
  } catch (error) {
    console.error("Error detecting file type:", error);
    return "application/octet-stream";
  }
}
