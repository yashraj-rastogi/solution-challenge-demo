const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function normalizeJoinCode(rawCode: string) {
  return rawCode.toUpperCase().replace(/[^A-Z0-9]/g, '').trim()
}

export function generateJoinCode(length = 6) {
  let result = ''
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length)
    result += ALPHABET[randomIndex]
  }
  return result
}

