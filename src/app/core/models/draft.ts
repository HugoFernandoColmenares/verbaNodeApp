export type DraftTask = 'commit' | 'pr' | 'prompt' | 'git';

export interface DraftRequest {
  task: DraftTask;
  language?: string;
  brief: string;
  context?: string;
  origin?: string;
}

export interface DraftResponse {
  task: DraftTask;
  draft: string;
  model: string;
}
