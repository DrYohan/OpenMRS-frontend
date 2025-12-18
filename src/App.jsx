import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Footer from "./component/footer";
import Home from "./component/pages/home";
import Center from "./component/pages/center";
import Location from "./component/pages/location";
import Department from "./component/pages/department";
import FixedAssetMiddleCategory from "./component/pages/fixedAssetMiddleCategory";
import ItemGRN from "./component/pages/ItemGRN";

function App() {
  return (
    <Router>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/center" element={<Center />} />
            <Route path="/location" element={<Location />} />
            <Route path="/department" element={<Department />} />
            <Route path="/fixed-asset" element={<FixedAssetMiddleCategory />} />
            <Route path="/item-grn" element={<ItemGRN />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
