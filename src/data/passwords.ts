// A predictable, in-memory counter for fictitious examples, not a security tool.
let demoCounter = 0

export function isStrongDemoPassword(value: string): boolean {
  return value.startsWith('DEMO-') && value.length === 20 &&
    /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value) &&
    /[^a-zA-Z0-9]/.test(value)
}

/** Returns a visibly fake example; never creates or persists a real credential. */
export function generateDemoPassword(
  existingPasswords: readonly string[] = [],
  currentPassword?: string,
): string {
  const excluded = new Set(existingPasswords)
  if (currentPassword) excluded.add(currentPassword)
  let candidate: string
  do {
    demoCounter += 1
    candidate = `DEMO-Vault!${demoCounter.toString(36).padStart(6, '0').slice(-6)}a9#`
  } while (excluded.has(candidate))
  return candidate
}
