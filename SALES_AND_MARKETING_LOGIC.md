# Sales & Marketing Module - Business Logic

This document outlines the business logic, workflow, and data structures implemented in the Sales and Marketing module of the Pharma ERP system.

## Overview

The Sales module is designed to manage the "Order-to-Cash" cycle, facilitating interactions with customers (Distributors, Hospitals, Pharmacies), processing sales orders, handling dispatches, and tracking financial status (Invoices & Payments).

**Note:** As of the current implementation, the "Marketing" aspect (campaigns, leads, CRM-style features) is not yet explicitly developed as a separate sub-module, but customer segmentation is supported via `Customer Type`.

## 1. Customer Management (`/sales/customers`)

This sub-module acts as the master data management for all clients.

- **Entities:** `Customer`
- **Key Attributes:**
  - `Type`: Categorizes customers into `Distributor`, `Hospital`, `Pharmacy`, or `Retail` for strategic segmentation.
  - `Status`: `Active` or `Inactive`.
  - `Credit Limit`: Defines financial thresholds for orders (Business Logic enforcement point).
  - `Payment Terms`: Standard terms (e.g., Net 30) associated with the customer.
  - `Billing/Shipping Addresses`: Support for logistics.

**Workflow:**

- Sales representatives create/onboard new customers.
- Customers appear in drop-downs during Order creation.

## 2. Sales Orders (`/sales/orders`)

The core transactional engine of the Sales module.

- **Entities:** `SalesOrder`
- **Lifecycle / Status Flow:**
  1.  **Draft**: Order is being created, items can be edited freely. No inventory impact yet.
  2.  **Confirmed**: Order is finalized and approved. Inventory allocation may occur here.
  3.  **Processing**: Warehouse is picking/packing the order.
  4.  **Dispatched**: Goods have left the warehouse. (Logistics phase).
  5.  **Delivered**: Customer has received the goods.
  6.  **Cancelled**: Order voided.

**Business Logic:**

- **Validation**: Orders are validated against Customer Credit Limits (future scope/backend enforcement) and Inventory Availability.
- **Draft Feature**: The frontend utilizes `localStorage` (via `FormDrawer`) to auto-save drafts, preventing data loss during complex order entry.
- **Date Handling**: Order Dates and Delivery Dates are strictly managed (using `dayjs`) to ensure accurate scheduling.

## 3. Dispatches (`/sales/dispatches`)

Handles the logistics of moving confirmed orders out of the warehouse.

- **Logic**: This module typically interacts with the Inventory module to deduct stock.
- **Actions**:
  - Generates Dispatch Notes / Gate Passes.
  - Updates Order Status to `Dispatched`.
  - Tracks carrier details (if implemented).

## 4. Invoices (`/sales/invoices`)

**Current Implementation Strategy:** Derived View.

- **Logic**: Unlike a separate database entity, Sales Invoices are currently **derived from Sales Orders** that are in `Confirmed`, `Dispatched`, or `Delivered` states.
- **Behavior**:
  - The system generates an "Invoice View" based on the Order details (Items, Quantities, Prices, Tax).
  - Status of the Invoice (Pending, Paid, Overdue) is mapped from the Order's payment status or delivery timeline.

## 5. Payments (`/sales/payments`)

Tracks incoming payments from customers.

- **Entities**: `Payment` (Incoming)
- **Workflow**:
  - Payments are recorded against `Sales Orders` (or the derived Invoice ID).
  - Supports multiple methods: `Bank Transfer`, `Cheque`, `Cash`.
  - **Financial Impact**: Recording a payment updates the "Outstanding Balance" of the Customer and the Status of the Order/Invoice (e.g., to `Fully Paid`).

## Summary of Data Flow

1.  **Customer** is onboarded.
2.  **Sales Order** is created (Draft -> Confirmed).
3.  **Warehouse** sees Confirmed order -> Processes -> **Dispatches**.
4.  **Invoice** is generated/viewable for the Dispatched Order.
5.  **Payment** is received and logged against the Order.
6.  **Analytics** (Dashboard) reflects the Revenue.

## Technical Notes

- **React Query**: Used extensively for caching and state management (`useSales`, `useCustomers`).
- **Ant Design**: Provides the UI components (Tables, Drawers, Modals).
- **Context API**: Notifications (`App.useApp().message`) and Modals are managed via Ant Design's App context for consistency.

## Future Scope (Marketing)

To fully realize the "Marketing" component, the following could be added:

- **Leads Pipeline**: Tracking potential customers before onboarding.
- **Campaigns**: Managing email/SMS blasts or discount promotions.
- **Analytics**: Sales performance by Region/Customer Type (already partially supported by Dashboard Charts).
