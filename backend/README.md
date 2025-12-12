# Inventory Management System (IMS) - Backend

A robust, full-stack REST API for managing warehouses, inventory tracking, and logistical operations. This system is built using the MERN stack (MongoDB, Express, React, Node.js) and adheres to industry-standard Layered Architecture (Controller-Service-Repository).

## Key Features

### Warehouse Management
* **Create & Manage:** Add new storage facilities with specific location and maximum capacity limits.
* **Capacity Tracking:** Automatically tracks `currentCapacity` vs `maxCapacity`.
* **Safe Deletion:** Prevents accidental deletion of warehouses that still contain inventory.

### Inventory Control
* **Automated SKU Generation:** Generates unique, sequential SKUs (e.g., N-0001) based on the warehouse prefix and current item count.
* **CRUD Operations:** Full Create, Read, Update, Delete capabilities for inventory items.
* **Search & Filter:** Retrieve items by ID or filter by specific warehouse.

### Advanced Logistics
* **Bulk Transfers:** Atomically transfer multiple items between warehouses.
* **Capacity Validation:** Strictly enforces capacity limits before allowing transfers or new item creation.
* **Smart SKU Handling:** During transfers, if an SKU exists in the destination, a new item is created; otherwise, the existing item record is moved.

---

## Technical Architecture

This project uses a Layered Architecture to ensure Separation of Concerns and Scalability:

1.  **Routes:** Define API endpoints and map them to controllers.
2.  **Controllers:** Handle HTTP requests/responses and extract data.
3.  **Services:** Contain the business logic (e.g., "Check capacity", "Calculate transfer total").
4.  **Repositories:** Handle direct database interactions (Mongoose queries).
5.  **Models:** Define Mongoose schemas and data validation rules.

### Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose ODM)
* **Tools:** Dotenv (Config), Cors (Security)

---

## Installation & Setup

### Prerequisites
* Node.js (v14 or higher)
* MongoDB (Local or Atlas Connection String)