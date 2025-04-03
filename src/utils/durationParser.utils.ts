export const parseDuration = (durationStr: string): number => {
  const unit = durationStr.slice(-1);
  const value = parseInt(durationStr.slice(0, -1), 10);
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      throw new Error(`Invalid duration unit: ${unit}`);
  }
};
