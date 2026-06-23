// ============================================================================
// 1. BASE CONFIGURATION & EXPORT FORMAT LABELS
// ============================================================================

import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Universal indexing mapping for your video application formats.
 * Explicitly typed to allow flexible frontend indexing without 'any' type conversion blocks.
 */
export const formatLabels: Record<string, string> = {
  "mp3-320": "Audio (MP3 320kbps)",
  "mp4-1080": "Video (MP4 1080p)",
  "mp4-720": "Video (MP4 720p)",
  "webm-2k": "Video (WebM 1440p)",
  wav: "WAV Audio",
  mov: "MOV Video",
  m4a: "M4A Audio",
};

export type AvailableFormat = keyof typeof formatLabels;

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================

export interface VideoInfo {
  id: string;
  title: string;
  duration: number; // in seconds
  thumbnail: string;
}

export interface QueueVideo {
  id: string;
  url: string;
  title: string;
  format: AvailableFormat;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  size?: string;
  filename?: string;
}

export interface CompletedFile {
  id: string;
  title: string;
  format: AvailableFormat;
  size: string;
  filename: string;
}

/**
 * Unified container payload mapping for FastAPI JSON responses
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================================
// 3. AXIOS INSTANCE INTERCEPTORS & ENGINE CONFIG
// ============================================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout threshold
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Lifecycle Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Failure Resolution Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    let errorMessage = "An unexpected network error occurred.";

    if (error.response) {
      // Unpacks validation exceptions or HTTPExceptions from FastAPI (.detail)
      const data = error.response.data as any;
      errorMessage =
        data?.detail ||
        data?.message ||
        `Server Error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage =
        "No response received from the conversion server. Please check your network backend status.";
    } else {
      errorMessage = error.message;
    }

    console.error("[API Service Interception Error]:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
);

// ============================================================================
// 4. LOCAL DOWNLOAD HELPER
// ============================================================================

/**
 * Handles raw response bytes/blobs directly inside memory and translates
 * them to a clean native browser window transfer action.
 */
const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ============================================================================
// 5. EXPORT CORE FUNCTION IMPLEMENTATIONS
// ============================================================================

/**
 * Retrieves structural title and metadata configurations regarding a YouTube link.
 * POST /video-info
 */
// Ensure your exports look exactly like this to match the backend JSON schema formats:

const fetchVideoInfo = async (url: string): Promise<VideoInfo> => {
  const response = await api.post<VideoInfo>("/video-info", { url });
  return response.data; 
};

const addToQueue = async (data: { url: string; format: AvailableFormat }): Promise<QueueVideo> => {
  const response = await api.post<QueueVideo>("/queue", data);
  return response.data;
};

const getQueue = async (): Promise<QueueVideo[]> => {
  const response = await api.get<QueueVideo[]>("/queue");
  return response.data;
};

const convertAll = async (): Promise<{ processed_count: number }> => {
  const response = await api.post<{ processed_count: number }>("/convert-all");
  return response.data;
};
/**
 * Directly downloads an isolated media output payload by file name matching.
 * GET /download/{filename}
 */
const downloadFile = async (filename: string): Promise<void> => {
  const response = await api.get(`/download/${encodeURIComponent(filename)}`, {
    responseType: "blob", // Prevents file data truncation or parsing corruption
  });
  triggerBlobDownload(response.data, filename);
};

/**
 * Compiles and delivers all active operational targets wrapped up within a .zip package.
 * GET /download-all
 */
const downloadAll = async (): Promise<void> => {
  const response = await api.get("/download-all", {
    responseType: "blob",
  });
  const timestamp = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(response.data, `fetchflow-bundle-${timestamp}.zip`);
};

/**
 * Established connection layout to process continuous stream progress values via EventSource.
 * GET /progress
 */
const createProgressEventSource = (): EventSource => {
  return new EventSource(`${API_BASE_URL}/progress`);
};

export {
  fetchVideoInfo,
  addToQueue,
  getQueue,
  convertAll,
  downloadFile,
  downloadAll,
  createProgressEventSource,
};
