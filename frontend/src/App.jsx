import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WarehousePage from "./pages/WarehousePage";
import WarehouseDetailPage from "./pages/WarehouseDetailPage";
// import InventoryPage from "./pages/InventoryPage";
// import InventoryDetailPage from "./pages/InventoryDetailPage";

function App() {
  return (    
    <div>
      
        <Routes>
        <Route path="/warehouses" element={<WarehousePage />} />
        <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
        {/* <Route path="/inventory" element={<InventoryPage />} /> */}
        {/* <Route path="/inventory/:id" element={<InventoryDetailPage />} /> */}
        </Routes>
      
    </div>
      );
}

export default App;