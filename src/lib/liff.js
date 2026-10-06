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

// GET requests send the LINE ID token in a header.
export const authHeaders = (idToken) => ({
  Authorization: `Bearer ${idToken}`,
});

export default liff;
