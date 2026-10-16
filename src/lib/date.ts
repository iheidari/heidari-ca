/**
 * Post dates are bare `YYYY-MM-DD` strings; pin them to UTC so the rendered
 * date can't drift a day between the build machine and the reader.
 */
export function postDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid post date "${date}"; expected YYYY-MM-DD`);
  }
  return parsed;
}

const formatters = {
  short: new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }),
  long: new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }),
};

export function formatPostDate(
  date: string,
  style: "short" | "long" = "short",
) {
  return formatters[style].format(postDate(date));
}
