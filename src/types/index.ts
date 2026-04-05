// ─── Game state ───────────────────────────────────────────────────────────────
export interface GameState {
  soundEnabled: boolean;
  language: string;
  /** Current score / progress – shape depends on final game design. */
  score: number;
}

// ─── Scene data payloads ──────────────────────────────────────────────────────
export interface GameSceneData {
  level?: number;
}

// ─── Asset manifest types ─────────────────────────────────────────────────────
export interface ImageAsset {
  key: string;
  path: string;
}

export interface AudioAsset {
  key: string;
  path: string | string[];
}
