// Utility for sanitizing domain search input
// Ported and adapted from a Python design to TypeScript

const LABEL_RE = /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const ALLOWED_RE = /^[A-Za-z0-9.-]+$/;

export function sanitizeDomainSearch(term: string | null | undefined): string {
  if (term === null || term === undefined) {
    throw new Error('Search term is required');
  }

  const t = term.trim();
  if (t === '') {
    throw new Error('Search term is empty');
  }

  if (t.length > 253) {
    throw new Error('Search term too long');
  }

  if (!ALLOWED_RE.test(t)) {
    throw new Error('Search term contains invalid characters');
  }

  const labels = t.split('.');
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if (label === '') {
      // empty labels allowed only at start or end (leading/trailing dot)
      if (i !== 0 && i !== labels.length - 1) {
        throw new Error('Invalid domain format: consecutive dots');
      }
      continue;
    }

    if (label.length > 63) {
      throw new Error('Domain label too long');
    }

    if (!LABEL_RE.test(label)) {
      throw new Error(`Invalid domain label: ${label}`);
    }
  }

  return t;
}

export function isValidDomainSearch(term: string | null | undefined): boolean {
  try {
    sanitizeDomainSearch(term);
    return true;
  } catch (e) {
    return false;
  }
}

export default { sanitizeDomainSearch, isValidDomainSearch };
