export interface AiRequest {
  name: string;
  manufacturer: string;
  type: string;
  operatingSystem: string;
  osVersion?: string;
  processor: string;
  ramAmount: number;
}

export interface AiResponse {
  description: string;
}
