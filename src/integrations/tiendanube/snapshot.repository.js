export function createSnapshotRepository({ now = () => Date.now(), ttlMs = 5 * 60 * 1000 } = {}) {
  const snapshots = new Map();
  return {
    save(key, value) {
      const fetchedAt = now();
      const snapshot = { value, fetchedAt: new Date(fetchedAt).toISOString(), expiresAt: new Date(fetchedAt + ttlMs).toISOString() };
      snapshots.set(key, snapshot);
      return snapshot;
    },
    getFresh(key) {
      const snapshot = snapshots.get(key);
      return snapshot && Date.parse(snapshot.expiresAt) > now() ? snapshot : null;
    },
    get(key) { return snapshots.get(key) || null; }
  };
}
