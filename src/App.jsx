import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview/Overview";
import CreateEvent from "./pages/CreateEvent/CreateEvent";
import ConfirmDate from "./pages/ConfirmDate/ConfirmDate";
import Participant from "./pages/Participant/Participant";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateEvent />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/confirm-date" element={<ConfirmDate />} />
        <Route path="/participant" element={<Participant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;