# MADAR - Sales and Inventory Management System

This is the frontend UI implementation for the MADAR system. It is built with **Next.js 14** and **Vanilla CSS** (CSS Variables) for a premium, custom design.

## Features Implemented
- **Dashboard**: Overview of sales, inventory status, and recent activity.
- **POS System (Point of Sale)**: Dedicated interface for processing sales with a product grid and cart.
- **Inventory/Products**: Management interface with data tables, filtering, and status badges.
- **Design System**: A custom variable-based CSS system allowing for easy theming (located in `app/globals.css`).

## Prerequisites
- Node.js 18.17 or later

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure
- `app/`: Next.js App Router pages.
    - `page.tsx`: Dashboard.
    - `sales/`: POS Page.
    - `products/`: Inventory Page.
- `components/`: Reusable UI components.
    - `layout/`: Sidebar, Header.
    - `ui/`: Badge, Cards, etc.
- `styles/`: (Global styles are in `app/globals.css`).

## Note on Backend
This version is a **UI-only scaffold**. Data is mocked directly in the components to demonstrate the interface. No database connection or API routes are currently active.
