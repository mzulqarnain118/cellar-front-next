export const procStr = str => {
  if (typeof str !== 'string') return ''
  let cnt = 0
  let updatedString = str
  let targetIndex = updatedString.indexOf('^^')
  while (targetIndex !== -1) {
    const newStr = cnt % 2 === 0 ? '<span class="highlighted">' : '</span>'
    const firstSub = updatedString.substring(0, targetIndex)
    const secondSub = updatedString.substring(targetIndex).replace('^^', newStr)
    updatedString = firstSub + secondSub
    targetIndex = updatedString.indexOf('^^')
    cnt++
  }

  return updatedString
}
