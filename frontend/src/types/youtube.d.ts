/**
 * TypeScript type definitions for YouTube IFrame API
 * Based on the official YouTube IFrame Player API
 */

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoUrl: () => string;
  getVideoEmbedCode: () => string;
  getVideoData: () => {
    video_id: string;
    author: string;
    title: string;
  };
  getPlayerState: () => YT.PlayerState;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  destroy: () => void;
  addEventListener: (event: string, listener: (event: any) => void) => void;
  removeEventListener: (event: string, listener: (event: any) => void) => void;
}

export namespace YT {
  type PlayerState = -1 | 0 | 1 | 2 | 3 | 5;
  // -1 (unstarted)
  // 0 (ended)
  // 1 (playing)
  // 2 (paused)
  // 3 (buffering)
  // 5 (video cued)

  interface PlayerVars {
    autoplay?: 0 | 1;
    cc_lang_pref?: string;
    cc_load_policy?: 0 | 1;
    color?: 'red' | 'white';
    controls?: 0 | 1 | 2;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: 'playlist' | 'search' | 'user_uploads';
    loop?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    widget_referrer?: string;
  }

  interface PlayerOptions {
    height?: number | string;
    width?: number | string;
    videoId?: string;
    playerVars?: PlayerVars;
    events?: {
      onReady?: (event: { target: YTPlayer }) => void;
      onStateChange?: (event: { data: PlayerState; target: YTPlayer }) => void;
      onError?: (event: { data: number; target: YTPlayer }) => void;
      onPlaybackQualityChange?: (event: { data: string; target: YTPlayer }) => void;
      onPlaybackRateChange?: (event: { data: number; target: YTPlayer }) => void;
      onApiChange?: (event: { target: YTPlayer }) => void;
    };
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions);
  }
}

export {};

