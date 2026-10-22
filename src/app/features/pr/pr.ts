import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { DraftClient } from '../../core/api/draft-client';
import { draftSession } from '../../core/api/draft-session';
import { WorkspaceStatus } from '../../core/api/workspace-status';
import { TaskForm } from '../../shared/task-form/task-form';
import { field } from '../form-fields';
import { text } from '../text';

@Component({
  selector: 'app-pr',
  imports: [TaskForm],
  templateUrl: './pr.html',
})
export class Pr {
  readonly text = text;
  private readonly session = draftSession(inject(DraftClient), inject(WorkspaceStatus));
  readonly brief = signal('');
  readonly context = signal('');
  readonly draft = this.session.draft;
  readonly error = this.session.error;
  readonly pending = this.session.pending;
  readonly meta = computed(() => {
    const textValue = this.draft();
    if (!textValue) return '';
    return `${textValue.length} characters`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.session.abort());
  }

  submit(form: HTMLFormElement): void {
    const brief = field(form, 'brief');
    const context = field(form, 'context');
    this.brief.set(brief);
    this.context.set(context);
    if (!brief) {
      this.error.set('Describe the use case.');
      return;
    }
    if (brief.length > 4000 || context.length > 24000) {
      this.error.set('The text is over the limit.');
      return;
    }
    void this.session.submit({ task: 'pr', language: 'en', brief, context });
  }
}
