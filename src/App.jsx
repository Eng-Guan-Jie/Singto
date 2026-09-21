import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview/Overview";
import CreateEvent from "./pages/CreateEvent/CreateEvent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateEvent />} />
        <Route path="/overview" element={<Overview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;