export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 8;
};

export const extractLinksAndEmails = (
  text: string
): { text: string; isLink: boolean; isEmail: boolean }[] => {
  const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|[\w.-]+@[\w.-]+\.[a-z]{2,})/gi;
  const parts: { text: string; isLink: boolean; isEmail: boolean }[] = [];

  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    if (start > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, start),
        isLink: false,
        isEmail: false,
      });
    }

    const matchText = match[0];
    const isEmail = /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/.test(matchText);
    const isLink = !isEmail;

    parts.push({ text: matchText, isLink, isEmail });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isLink: false,
      isEmail: false,
    });
  }

  return parts;
};
