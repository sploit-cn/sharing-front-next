// format number to k/m/b
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}b`
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}m`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}
