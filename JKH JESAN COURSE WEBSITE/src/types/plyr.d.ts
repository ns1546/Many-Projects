declare module 'plyr' {
  export interface PlyrOptions {
    controls?: string[];
    settings?: string[];
    speed?: { selected: number; options: number[] };
    quality?: { default: number; options: number[]; forced?: boolean; onChange?: (newQuality: number) => void };
    ratio?: string;
    autoplay?: boolean;
    seekTime?: number;
    volume?: number;
    muted?: boolean;
    clickToPlay?: boolean;
    keyboard?: { focused?: boolean; global?: boolean };
    tooltips?: { controls?: boolean; seek?: boolean };
    captions?: { active?: boolean; language?: string; update?: boolean };
    fullscreen?: { enabled?: boolean; fallback?: boolean; iosNative?: boolean; container?: any };
    youtube?: {
      noCookie?: boolean;
      rel?: number;
      showinfo?: number;
      iv_load_policy?: number;
      modestbranding?: number;
      controls?: number;
      disablekb?: number;
      customControls?: boolean;
    };
    [key: string]: any;
  }

  export default class Plyr {
    constructor(target: HTMLElement | string, options?: PlyrOptions);
    play(): Promise<void>;
    pause(): void;
    togglePlay(toggle?: boolean): void;
    restart(): void;
    rewind(seekTime?: number): void;
    forward(seekTime?: number): void;
    destroy(): void;
    on(event: string, callback: (event: any) => void): void;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    speed: number;
    playing: boolean;
    quality: number;
    media: any;
    embed: any;
    fullscreen: {
      active: boolean;
      enter(): void;
      exit(): void;
      toggle(): void;
    };
    source: any;
    elements: {
      container: HTMLElement;
      wrapper: HTMLElement;
      settings?: {
        panels?: {
          quality?: HTMLElement;
          speed?: HTMLElement;
          [key: string]: any;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }
}

declare module 'plyr/dist/plyr.css';
