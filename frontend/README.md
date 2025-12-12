# Inventory Management System (IMS) - Frontend

The client-side application for the IMS, built with **React (Vite)**. This interface provides a responsive, user-friendly dashboard for administrators to manage warehouses, track inventory levels in real-time, and execute complex logistical operations like bulk transfers.

## Key Features

### Executive Dashboard
* **Real-Time Metrics:** Instantly view the total number of active warehouses and inventory items upon login.
* **Quick Navigation:** Card-based layout for easy access to core modules.

### Warehouse Management
* **Visual Capacity Tracking:** Warehouses are displayed as cards with live progress bars indicating capacity usage (Green/Yellow/Red status).
* **Location Management:** Integrated dynamic dropdowns for selecting US States and Cities during warehouse creation.
* **Safe Deletion:** Implements confirmation modals and prevents deletion of non-empty warehouses.

### Inventory Operations
* **Bulk Actions:** Select multiple items to delete or transfer them in a single batch.
* **Smart Transfers:** A custom "Transfer Wizard" allows users to select destination warehouses and adjust quantities for each item individually.
* **Stock Alerts:** Visual badges automatically flag items as "Low Stock" or "Critical" based on quantity thresholds.
* **Search & Filter:** Instantly filter inventory by name, SKU, or stock status.

---

## Tech Stack

* **Framework:** [React 18](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
* **Routing:** [React Router DOM v6](https://reactrouter.com/)
* **HTTP Client:** [Axios](https://axios-http.com/) (Pre-configured instance)
* **UI Feedback:** [React Hot Toast](https://react-hot-toast.com/) (Notifications)
* **Form Components:** [React Select](https://react-select.com/) (Dropdowns)
* **Location Data:** [Country-State-City](https://www.npmjs.com/package/country-state-city) (Geography library)

---

## Installation & Setup

### Prerequisites
* Node.js (v14 or higher)
* The **IMS Backend** must be running on `http://localhost:5000` (Default configuration).