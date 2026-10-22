import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DraftRequest, DraftResponse } from '../models/draft';

@Injectable({ providedIn: 'root' })
export class DraftClient {
  private readonly http = inject(HttpClient);

  submit(request: DraftRequest): Observable<DraftResponse> {
    return this.http.post<DraftResponse>('/webhook/verba/draft', request, { timeout: 130_000 });
  }
}

export function draftErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'n8n is not running';
    const body = error.error;
    if (body && typeof body === 'object') {
      const detail = 'error' in body ? body.error : 'message' in body ? body.message : '';
      if (typeof detail === 'string' && detail.trim()) return detail;
    }
    if (error.status === 504) return 'The local model timed out';
    if (error.status === 503) return 'Local model server is not running';
    if (error.status === 502) return 'The model returned an empty draft';
  }
  return 'The draft request failed';
}
