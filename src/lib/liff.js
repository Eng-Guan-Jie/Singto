import liff from "@line/liff";

let initPromise = null;

// liff.init() should only run once per page load. Pages
// share this promise so navigating between them (e.g.
// Create Event → Overview) does not initialize twice.
export const initLiff = () => {
  if (!initPromise) {
    initPromise = liff.init({
      liffId: import.meta.env.VITE_LIFF_ID,
    });
  }

  return initPromise;
};

// Refresh this many ms before the token's real expiry.
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

// Returns a usable LINE ID token, or null while redirecting
// to LINE Login. Call after initLiff().
//
// Outside the LINE app, LIFF keeps the ID token from the
// last login in browser storage, so isLoggedIn() stays true
// after the token itself has expired and LINE rejects it.
// In that case log out and in again to get a fresh one.
export const getFreshIdToken = () => {
  if (!liff.isLoggedIn()) {
    liff.login();
    return null;
  }

  const decoded = liff.getDecodedIDToken();

  const isExpired =
    !decoded ||
    decoded.exp * 1000 < Date.now() + EXPIRY_MARGIN_MS;

  if (isExpired && !liff.isInClient()) {
    liff.logout();
    liff.login();
    return null;
  }

  const token = liff.getIDToken();

  if (!token) {
    // getIDToken() is null when the LIFF app lacks
    // the "openid" scope.
    throw new Error("Unable to get LINE ID token.");
  }

  return token;
};

// GET requests send the LINE ID token in a header.
export const authHeaders = (idToken) => ({
  Authorization: `Bearer ${idToken}`,
});

export default liff;
