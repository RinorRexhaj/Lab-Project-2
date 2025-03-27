import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

export const useTimeAgo = () => {
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = (now.getTime() - new Date(date).getTime()) / 1000;
    if (diffInSeconds < 10) {
      return "now";
    }
    return timeAgo.format(new Date(date), "mini-now");
  };

  const formatSent = (date: Date) => {
    const sent = new Date(date);
    sent.toLocaleDateString("en-CA");
    const hours = sent.getHours().toString().padStart(2, "0");
    const minutes = sent.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const newDate = new Date(date);

    const getLocalDateString = (d: Date) => d.toLocaleDateString("en-CA");

    const today = getLocalDateString(now);
    const yesterday = getLocalDateString(
      new Date(now.setDate(now.getDate() - 1))
    );
    const targetDate = getLocalDateString(newDate);

    const hours = newDate.getHours().toString().padStart(2, "0");
    const minutes = newDate.getMinutes().toString().padStart(2, "0");

    if (targetDate === today) {
      return `Today at ${hours}:${minutes}`;
    } else if (targetDate === yesterday) {
      return `Yesterday at ${hours}:${minutes}`;
    } else {
      const diffInMs = newDate.getTime() - new Date().getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays >= -6 && diffInDays <= 6) {
        return `${newDate.toLocaleDateString("en-US", {
          weekday: "long",
        })} at ${hours}:${minutes}`;
      } else {
        return `${newDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} at ${hours}:${minutes}`;
      }
    }
  };

  const getDiff = (first: Date, second: Date) => {
    const diffInMs = Math.abs(first.getTime() - second.getTime());
    const diffInMinutes = diffInMs / (1000 * 60);

    const firstDateString = first.toISOString().split("T")[0];
    const secondDateString = second.toISOString().split("T")[0];

    return diffInMinutes > 1 || firstDateString !== secondDateString;
  };

  return { formatTime, formatDate, formatSent, getDiff };
};
