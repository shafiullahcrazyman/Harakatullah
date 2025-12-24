
export interface TashkeelResult {
  original: string;
  diacritized: string;
  explanation?: string;
}

export interface HistoryItem {
  id: string;
  type: 'tashkeel' | 'ocr';
  content: string;
  result: string;
  timestamp: number;
}
