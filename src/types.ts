// src/types.ts

export interface WebSocketMessage {
  error?: string;
  results?: RecognitionResult[];
}

export interface RecognitionResult {
  recognized: boolean;
  student_id: string | null;
  name: string;
  confidence: number | null;
  bounding_box: number[];
  message: string;
}
