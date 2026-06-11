// Utility functions and components for handling expiry dates in the frontend by Zilin Xu on 5/21/2026

import React from "react";

export function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split("-").map(Number);
  const exp = new Date(y, m - 1, d);
  return Math.round((exp - today) / (1000 * 60 * 60 * 24));
}

export function ExpiryBadge({ dateStr }) {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return <span className="text-gray-400 text-xs">No date</span>;
  if (days < 0) return <span className="inline-block rounded-full bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5">Expired</span>;
  if (days === 0) return <span className="inline-block rounded-full bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5">Expires today</span>;
  if (days <= 3) return <span className="inline-block rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5">Expires in {days}d</span>;
  return <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5">Expires in {days}d</span>;
}

export function rowColor(dateStr) {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return "";
  if (days < 0) return "bg-red-50";
  if (days <= 3) return "bg-yellow-50";
  return "";
}
