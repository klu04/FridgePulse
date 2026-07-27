export function daysUntilExpiration(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  const exp = new Date(y, m - 1, d);
  return Math.round((exp - today) / (1000 * 60 * 60 * 24));
}

export function daysSinceCreated(dateStr) {
    if (!dateStr) return null;

    const created = new Date(dateStr);
    if (Number.isNaN(created.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    created.setHours(0, 0, 0, 0);

    return Math.floor((today.getTime() - created.getTime()) / 86400000);
}