# Inventory Management System (IMS)

An enterprise-grade full-stack application designed to empower administrators with complete control over warehouse entities and inventory tracking across multiple locations. This solution is built using the MERN stack (MongoDB, Express.js, React, Node.js) and adheres to industry-standard development practices including layered architecture and responsive design.

## Project Overview

The IMS solves complex logistical challenges by providing a centralized dashboard for:
* **Warehouse Management:** Creating and monitoring storage facilities with strict capacity enforcement.
* **Inventory Control:** Tracking stock levels, generating automatic SKUs, and managing product details.
* **Logistics Operations:** Facilitating complex bulk transfers between warehouses while ensuring data integrity and capacity compliance.

## Technical Architecture

The application follows a client-server architecture:

1.  **Backend (Server):** A RESTful API built with Node.js and Express. It utilizes a Service-Repository pattern to separate business logic from database access. It connects to a MongoDB database to store warehouse and inventory records.
2.  **Frontend (Client):** A Single Page Application (SPA) built with React (Vite). It consumes the backend API to provide a dynamic, responsive user interface.



[Image of MERN stack architecture diagram]


### Technology Stack

**Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **ODM:** Mongoose
* **Utilities:** Dotenv, Cors

**Frontend**
* **Framework:** React 18
* **Build Tool:** Vite
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **UI Components:** React Select, React Hot Toast
* **Styling:** CSS-in-JS (Component-scoped styles)

---

## Features

### Warehouse Operations
* **Capacity Management:** Real-time tracking of current usage versus maximum capacity.
* **Atomic Updates:** Uses database-level atomic operators to prevent race conditions during concurrent updates.
* **Location Management:** Integration with geographic data libraries for accurate location selection.

### Inventory Operations
* **Automated SKU Generation:** Uniquely identifies items based on warehouse prefixes and sequential counters.
* **Bulk Transfers:** Allows moving multiple items between warehouses in a single transaction, with strict validation to prevent overfilling destination warehouses.
* **Stock Alerts:** Visual indicators for low-stock and critical-level items.

---

## Getting Started

Follow these instructions to run the project locally. You will need two separate terminal instances: one for the backend server and one for the frontend client.

### Prerequisites
* Node.js (v14.0.0 or higher)
* MongoDB (Running locally or via Atlas)
* Git

### 1. Repository Setup
Clone the repository to your local machine:
```bash
git clone [https://github.com/GGabriel007/inventory-management.git](https://github.com/GGabriel007/inventory-management.git)
cd inventory-management