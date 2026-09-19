/**
 * Reading time travels through the app as a number of minutes; this is the one
 * place that turns it into the phrase, so a caller never has to un-format it.
 */
export function formatReadingTime(minutes: number) {
  return `${minutes} min read`;
}
