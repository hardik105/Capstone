import React from "react";
import DataLineageForm from "./DataLineageForm";
import LandingPage from "./LandingPage";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<DataLineageForm />} />
      </Routes>
    </Router>
  );
};

export default App;
