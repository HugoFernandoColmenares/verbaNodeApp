import { Injectable, computed, signal } from '@angular/core';

export type WorkspacePhase = 'ready' | 'working' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class WorkspaceStatus {
  readonly phase = signal<WorkspacePhase>('ready');
  readonly label = computed(() => {
    const phase = this.phase();
    if (phase === 'working') return 'Working';
    if (phase === 'unavailable') return 'Unavailable';
    return 'Ready';
  });
}
