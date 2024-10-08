export function wordWrap(text: string, trimLen: number = 40) {
  if (text.length < trimLen) {
    return text;
  }
  return text.substring(0, trimLen) + "...";
}
export function trimId(id: string, visibleChars = 4) {
  if (id.length <= visibleChars * 2) {
    // If the string is shorter or equal to the visible characters on both sides, return it as is.
    return id;
  }

  // Trim the ID and insert "..." between the first and last parts
  const firstPart = id.slice(0, visibleChars);
  const lastPart = id.slice(-visibleChars);

  return `${firstPart}...${lastPart}`;
}

function getRelativeTime(date: Date): string | null {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return null; // Indicates that we should format as a full date
  }
}

export function formatDiscordTime(date: Date): string {
  const relativeTime = getRelativeTime(date);
  if (relativeTime) {
    return relativeTime; // Return relative time if within the last week
  }

  // If more than a week old, format the date
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const baseUrl = `localhost:4000`;
export const WebsocketApi = {
  GroupJoin: (groupId: string, userId: string) =>
    `ws://${baseUrl}/group/${groupId}__${userId}`
}
