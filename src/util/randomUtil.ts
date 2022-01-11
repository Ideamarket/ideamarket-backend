import { generateUsername } from 'unique-username-generator'

export function getRandomString() {
  const maxLength = getRandomIntegerInInterval(5, 15)
  return generateUsername('', 2, maxLength)
}

function getRandomIntegerInInterval(min: number, max: number) {
  const minInt = Math.ceil(min)
  const maxInt = Math.floor(max)
  return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt)
}
