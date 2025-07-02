export default function getDate() {
  const formatter = new Intl.DateTimeFormat("ru", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    year: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return formatter.format(new Date());
}
