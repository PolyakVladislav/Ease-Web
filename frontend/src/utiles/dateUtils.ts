export function getStartOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7;
  now.setDate(now.getDate() - diff);
  now.setHours(0, 0, 0, 0);
  return now;
}

export function stripTime(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatSlot(slotISO: string): string {
  const d = new Date(slotISO);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}


export function formatDateShortFancy(dateISO: string): string {
  const d = new Date(dateISO);
  const day = d.getDate();
  const monthName = d.toLocaleString("en", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${monthName} ${year}`;
}

export function timeAgoFromNow(isoString: string): string {
  const now = new Date();
  const created = new Date(isoString);
  const diffMs = now.getTime() - created.getTime(); 

  if (diffMs < 0) {
    return "just now";
  }

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  return `${diffDays} days ago`;
}

export function timeLeftUntil(dateISO: string): string {
  const now = new Date();
  const appt = new Date(dateISO);

  const diffMs = appt.getTime() - now.getTime();
  if (diffMs <= 0) {
    return "Already passed"; 
  }

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return `${diffSec} second${diffSec !== 1 ? "s" : ""} left`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} left`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} left`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
}