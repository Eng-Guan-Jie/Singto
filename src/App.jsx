import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/confirm-date" element={<ConfirmDate />} />
        <Route path="/participant" element={<Participant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;