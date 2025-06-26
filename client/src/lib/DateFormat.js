export const dateFormat = (data) => {
  return new Date(data).toDateString("en-US", {
    year: "numeric",
    month: "long",
    weekday: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
