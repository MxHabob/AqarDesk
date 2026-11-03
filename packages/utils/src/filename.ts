export function stripSpecialCharacters(inputString: string) {
  return inputString
    .replace(/[^a-zA-Z0-9-_\s.]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
}
