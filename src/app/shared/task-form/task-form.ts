import { Component, input, output } from '@angular/core';

import { DraftPane } from '../draft-pane/draft-pane';

@Component({
  selector: 'app-task-form',
  imports: [DraftPane],
  templateUrl: './task-form.html',
})
export class TaskForm {
  readonly title = input.required<string>();
  readonly hint = input.required<string>();
  readonly pending = input(false);
  readonly draft = input('');
  readonly error = input('');
  readonly mono = input(true);
  readonly meta = input('');
  readonly write = output<HTMLFormElement>();

  onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (form instanceof HTMLFormElement) this.write.emit(form);
  }
}
