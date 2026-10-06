import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { initLiff } from "./lib/liff";
import Overview from "./pages/Overview/Overview";
import CreateEvent from "./pages/CreateEvent/CreateEvent";
import ConfirmDate from "./pages/ConfirmDate/ConfirmDate";
import Participant from "./pages/Participant/Participant";

// The LIFF Endpoint URL is the site root, so LIFF links
// land here first:
// - liff.line.me/{id}/participant?eventId=… arrives as
//   /?liff.state=… and liff.init() redirects to that page.
// - Links sent before the endpoint moved to the root
//   (liff.line.me/{id}?eventId=…) arrive as /?eventId=…
//   and belong to the Participant page.
function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasLiffState = searchParams.has("liff.state");

  useEffect(() => {
    if (!hasLiffState) return;

    initLiff()
      .then(() => {
        // If LIFF rewrote the URL without reloading the
        // page, tell the router about the new location.
        const { pathname, search } = window.location;

        if (!search.includes("liff.state")) {
          navigate(`${pathname}${search}`, {
            replace: true,
          });
        }
      })
      .catch((error) => {
        console.error(
          "LIFF initialization failed:",
          error
        );
      });
  }, [hasLiffState, navigate]);

  if (hasLiffState) {
    return <p>Loading...</p>;
  }

  if (searchParams.has("eventId")) {
    return (
      <Navigate
        to={`/participant?${searchParams}`}
        replace
      />
    );
  }

  return <CreateEvent />;
}

const PAGES = [
  "create-event",
  "overview",
  "confirm-date",
  "participant",
];

// Any URL without a route. If the LIFF Endpoint URL is a
// page path instead of the site root, LIFF links double the
// path (e.g. /participant/participant?eventId=…), so send
// those to the page named in the last segment.
function Fallback() {
  const { pathname, search } = useLocation();
  const lastSegment = pathname
    .split("/")
    .filter(Boolean)
    .pop();

  if (PAGES.includes(lastSegment)) {
    return (
      <Navigate
        to={`/${lastSegment}${search}`}
        replace
      />
    );
  }

  return <p>Page not found.</p>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/confirm-date" element={<ConfirmDate />} />
        <Route path="/participant" element={<Participant />} />
        <Route path="*" element={<Fallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;