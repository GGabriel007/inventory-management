import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WarehousePage from "./pages/WarehousePage";
import WarehouseDetailPage from "./pages/WarehouseDetailPage";
import InventoryPage from "./pages/InventoryPage";
import InventoryDetailPage from "./pages/InventoryDetailPage";
import Navbar from "./components/layout/Navbar";
import WarehouseCreatePage from "./pages/WarehouseCreatePage";

function App() {
  return (    
    <div>
      <Navbar />
      
        <Routes>

        {/* HOME PAGE */}
        <Route path="/" element={<HomePage/>} />
        

        {/* WAREHOUSES */}
        <Route path="/warehouses" element={<WarehousePage />} />
        <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />

        <Route path="/warehouses/create" element={<WarehouseCreatePage />} />

        {/* Inventory Routes */}
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        </Routes>
      
    </div>
      );
}

export default App;