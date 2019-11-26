const deepMerge = (from, to) => {
  if (!to) return from;
  if (!from) return to;
  Object.keys(from).map(key => {
    if (!to[key]) {
      to[key] = from[key];
    } else {
      to[key] = deepMerge(from[key], to[key]);
    }
  });
  return to;
}

module.exports = {
  deepMerge
};