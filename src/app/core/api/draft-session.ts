import { signal } from '@angular/core';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';

import { DraftRequest } from '../models/draft';
import { DraftClient, draftErrorMessage } from './draft-client';
import { WorkspaceStatus } from './workspace-status';

export function draftSession(client: DraftClient, status: WorkspaceStatus) {
  const draft = signal('');
  const error = signal('');
  const pending = signal(false);
  let cancel = new Subject<void>();

  async function submit(request: DraftRequest): Promise<void> {
    abort();
    const stop = cancel;
    pending.set(true);
    error.set('');
    status.phase.set('working');
    try {
      const response = await firstValueFrom(client.submit(request).pipe(takeUntil(stop)));
      if (stop.closed) return;
      draft.set(response.draft ?? '');
      status.phase.set('ready');
    } catch (caught) {
      if (stop.closed) return;
      error.set(draftErrorMessage(caught));
      status.phase.set('unavailable');
    } finally {
      if (stop === cancel) pending.set(false);
    }
  }

  function abort(): void {
    cancel.next();
    cancel.complete();
    cancel = new Subject<void>();
    pending.set(false);
  }

  return { draft, error, pending, submit, abort };
}
