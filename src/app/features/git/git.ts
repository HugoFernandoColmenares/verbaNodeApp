import { Component, DestroyRef, inject, signal } from '@angular/core';

import { DraftClient } from '../../core/api/draft-client';
import { draftSession } from '../../core/api/draft-session';
import { WorkspaceStatus } from '../../core/api/workspace-status';
import { TaskForm } from '../../shared/task-form/task-form';
import { field } from '../form-fields';
import { text } from '../text';

@Component({
  selector: 'app-git',
  imports: [TaskForm],
  templateUrl: './git.html',
})
export class Git {
  readonly text = text;
  private readonly session = draftSession(inject(DraftClient), inject(WorkspaceStatus));
  readonly brief = signal('first commit');
  readonly origin = signal('');
  readonly draft = this.session.draft;
  readonly error = this.session.error;
  readonly pending = this.session.pending;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.session.abort());
  }

  submit(form: HTMLFormElement): void {
    const brief = field(form, 'brief');
    const origin = field(form, 'origin');
    this.brief.set(brief);
    this.origin.set(origin);
    if (!brief) {
      this.error.set('Add a commit message.');
      return;
    }
    if (brief.includes('\n')) {
      this.error.set('The commit message must be a single line.');
      return;
    }
    if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(origin)) {
      this.error.set('Use an https://github.com/owner/repo.git URL.');
      return;
    }
    void this.session.submit({ task: 'git', brief, origin });
  }
}
