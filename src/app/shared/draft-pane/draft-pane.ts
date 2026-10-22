import { Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-draft-pane',
  templateUrl: './draft-pane.html',
})
export class DraftPane {
  readonly text = input('');
  readonly pending = input(false);
  readonly error = input('');
  readonly mono = input(true);
  readonly meta = input('');
  readonly copied = signal(false);

  constructor() {
    effect(() => {
      this.text();
      this.copied.set(false);
    });
  }

  async copy(): Promise<void> {
    const value = this.text();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }
}
