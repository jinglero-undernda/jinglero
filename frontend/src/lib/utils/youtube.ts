/**
 * YouTube URL parsing utilities
 * Handles various YouTube URL formats and converts them to video IDs and embed URLs
 */

/**
 * Regular expression patterns for extracting YouTube video IDs
 */
const YOUTUBE_URL_PATTERNS = [
  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  // Short URL: https://youtu.be/VIDEO_ID
  /^([a-zA-Z0-9_-]{11})$/,
];

/**
 * Extracts the YouTube video ID from various URL formats
 * 
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - VIDEO_ID (just the ID itself)
 * 
 * @param urlOrId - YouTube URL or video ID
 * @returns The extracted video ID, or null if not a valid YouTube URL/ID
 * 
 * @example
 * extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 * extractVideoId('https://youtu.be/dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 * extractVideoId('dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 */
export function extractVideoId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') {
    return null;
  }

  // Try each pattern
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = urlOrId.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matches and it looks like a valid video ID (11 characters, alphanumeric + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  return null;
}

/**
 * Builds a YouTube embed URL from a video ID or URL
 * 
 * @param videoIdOrUrl - YouTube video ID or URL
 * @param options - Optional parameters for the embed URL
 * @param options.autoplay - Whether to autoplay the video (default: false)
 * @param options.start - Start time in seconds (default: 0)
 * @param options.controls - Whether to show controls (default: true)
 * @param options.rel - Whether to show related videos (default: false)
 * @returns The embed URL, or null if the input is invalid
 * 
 * @example
 * buildEmbedUrl('dQw4w9WgXcQ') // 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
 * buildEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { autoplay: true, start: 30 })
 * // 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&start=30'
 */
export function buildEmbedUrl(
  videoIdOrUrl: string | null | undefined,
  options: {
    autoplay?: boolean;
    start?: number;
    controls?: boolean;
    rel?: boolean;
  } = {}
): string | null {
  const videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) {
    return null;
  }

  const embedBase = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const params = new URLSearchParams();

  if (options.autoplay) {
    params.append('autoplay', '1');
  }

  if (options.start !== undefined && options.start > 0) {
    params.append('start', Math.floor(options.start).toString());
  }

  if (options.controls === false) {
    params.append('controls', '0');
  }

  if (options.rel === false) {
    params.append('rel', '0');
  }

  const queryString = params.toString();
  return queryString ? `${embedBase}?${queryString}` : embedBase;
}

/**
 * Builds a standard YouTube watch URL from a video ID or URL
 * 
 * @param videoIdOrUrl - YouTube video ID or URL
 * @param options - Optional parameters for the watch URL
 * @param options.t - Start time in seconds (default: undefined)
 * @returns The watch URL, or null if the input is invalid
 * 
 * @example
 * buildWatchUrl('dQw4w9WgXcQ') // 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
 * buildWatchUrl('dQw4w9WgXcQ', { t: 30 }) // 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s'
 */
export function buildWatchUrl(
  videoIdOrUrl: string | null | undefined,
  options: { t?: number } = {}
): string | null {
  const videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) {
    return null;
  }

  const watchBase = `https://www.youtube.com/watch?v=${videoId}`;
  
  if (options.t !== undefined && options.t > 0) {
    return `${watchBase}&t=${Math.floor(options.t)}s`;
  }

  return watchBase;
}

/**
 * Validates whether a string is a valid YouTube URL or video ID
 * 
 * @param urlOrId - YouTube URL or video ID to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // true
 * isValidYouTubeUrl('dQw4w9WgXcQ') // true
 * isValidYouTubeUrl('invalid') // false
 */
export function isValidYouTubeUrl(urlOrId: string | null | undefined): boolean {
  return extractVideoId(urlOrId) !== null;
}

