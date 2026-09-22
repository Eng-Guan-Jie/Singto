import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview/Overview";
import CreateEvent from "./pages/CreateEvent/CreateEvent";
import ConfirmDate from "./pages/ConfirmDate/ConfirmDate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateEvent />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/confirm-date" element={<ConfirmDate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;