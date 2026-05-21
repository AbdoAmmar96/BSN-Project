// Local YYYY-MM-DD (matches <input type="date">), avoiding the UTC off-by-one
// that toISOString() alone causes for users behind UTC.
export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};
