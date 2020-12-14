export function formatDate(str: string) {
  return new Date(str).toLocaleString("default", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
