export function field(form: HTMLFormElement, name: string): string {
  const value = form.elements.namedItem(name);
  if (value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement || value instanceof HTMLSelectElement) {
    return value.value.trim();
  }
  return '';
}
