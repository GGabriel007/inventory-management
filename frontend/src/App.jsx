import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WarehousePage from "./pages/WarehousePage";
import WarehouseDetailPage from "./pages/WarehouseDetailPage";
import InventoryPage from "./pages/InventoryPage";
import InventoryDetailPage from "./pages/InventoryDetailPage";
import Navbar from "./components/layout/Navbar";
import WarehouseEditPage from "./pages/WarehouseEditPage";
import { Toaster } from "react-hot-toast";
import WarehouseCreatePage from "./pages/warehouseCreatePage";
import InventoryCreatePage from "./pages/InventoryCreatePage";


function App() {
  return (    
    <div>
      <Navbar />
      
      <Toaster  />
        <Routes>

        {/* HOME PAGE */}
        <Route path="/" element={<HomePage/>} />
        

        {/* WAREHOUSES */}
        <Route path="/warehouses" element={<WarehousePage />} />
        <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
        <Route path="/warehouses/new" element={<WarehouseCreatePage />} />

        <Route path="/warehouses/:id/edit" element={<WarehouseEditPage />} />

        {/* Inventory Routes */}
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        <Route path="/warehouses/:warehouseId/inventory/new" element={<InventoryCreatePage />} 
/>
        </Routes>
      
    </div>
      );
}

export default App;