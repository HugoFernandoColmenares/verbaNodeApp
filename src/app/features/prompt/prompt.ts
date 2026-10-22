import { Component, DestroyRef, inject, signal } from '@angular/core';

import { DraftClient } from '../../core/api/draft-client';
import { draftSession } from '../../core/api/draft-session';
import { WorkspaceStatus } from '../../core/api/workspace-status';
import { TaskForm } from '../../shared/task-form/task-form';
import { field } from '../form-fields';
import { text } from '../text';

@Component({
  selector: 'app-prompt',
  imports: [TaskForm],
  templateUrl: './prompt.html',
})
export class Prompt {
  readonly text = text;
  private readonly session = draftSession(inject(DraftClient), inject(WorkspaceStatus));
  readonly brief = signal('');
  readonly context = signal('');
  readonly draft = this.session.draft;
  readonly error = this.session.error;
  readonly pending = this.session.pending;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.session.abort());
  }

  submit(form: HTMLFormElement): void {
    const brief = field(form, 'brief');
    const context = field(form, 'context');
    this.brief.set(brief);
    this.context.set(context);
    if (!brief) {
      this.error.set('Describe what the assistant should do.');
      return;
    }
    if (brief.length > 4000 || context.length > 24000) {
      this.error.set('The text is over the limit.');
      return;
    }
    void this.session.submit({ task: 'prompt', brief, context });
  }
}
