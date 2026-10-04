export function createTokenStore({ now = () => Date.now() } = {}) {
  let current = null;

  return {
    set({ accessToken, openId, scope, expiresIn }) {
      if (!accessToken || !openId || typeof scope !== "string") {
        throw new TypeError("A complete TikTok access token record is required.");
      }

      const lifetimeSeconds = Number(expiresIn);

      if (!Number.isFinite(lifetimeSeconds) || lifetimeSeconds <= 0) {
        throw new TypeError("TikTok access token expiration is invalid.");
      }

      current = {
        accessToken,
        openId,
        scope,
        expiresAt: now() + (lifetimeSeconds * 1000)
      };
    },

    get() {
      if (!current) {
        return null;
      }

      if (current.expiresAt <= now()) {
        current = null;
        return null;
      }

      return { ...current };
    },

    clear() {
      current = null;
    }
  };
}

export const tokenStore = createTokenStore();
