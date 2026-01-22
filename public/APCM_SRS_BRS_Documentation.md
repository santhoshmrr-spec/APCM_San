# Auction Payment Computation Module (APCM)
## Software Requirements Specification (SRS) & Business Requirements Specification (BRS)

**Document Version:** 1.0  
**Date:** December 16, 2024  
**Prepared By:** S@N  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Business Requirements Specification (BRS)](#2-business-requirements-specification-brs)
3. [Software Requirements Specification (SRS)](#3-software-requirements-specification-srs)
4. [Calculation Logic](#4-calculation-logic)
5. [User Interface Specifications](#5-user-interface-specifications)
6. [Data Dictionary](#6-data-dictionary)

---

## 1. Introduction

### 1.1 Purpose
The Auction Payment Computation Module (APCM) is an internal tool designed for e-commerce company employees to calculate and analyze payment breakups for lot-based auctions.

### 1.2 Scope
This document outlines the complete business and software requirements for the APCM system, including calculation logic, user interface specifications, and data structures.

### 1.3 Target Users
- E-commerce company employees
- Auction managers
- Finance teams

---

## 2. Business Requirements Specification (BRS)

### 2.1 Business Objectives
- Provide accurate lot-based payment calculations
- Enable real-time computation of auction payments
- Support multiple payment modes (Service Charge & Transaction Fees)
- Generate exportable payment breakup reports

### 2.2 Functional Business Requirements

#### BR-001: Multi-Lot Management
- System shall support multiple lots per calculation session
- Each lot shall have independent input values
- Lots can be added or removed dynamically

#### BR-002: Payment Mode Selection
- System shall support two payment modes:
  - **Service Charge Mode**: Standard service charge calculations
  - **Transaction Fees Mode**: Alternative fee structure

#### BR-003: Tax Configuration
- GST on RCM (Reverse Charge Mechanism) basis toggle
- Configurable GST percentage (5% or 18%)
- Configurable TCS percentage (NA/0%, 1%, 2%)
- IT TDS toggle (0.1% of material value)
- TCS on GST toggle (1% of material value)
- TDS on Service Charge toggle (2% of service charge)

#### BR-004: Security Deposit Handling
- Three modes: Not Applicable, Percentage, Lumpsum
- Non-adjustable once calculated
- Included in payment calculations

#### BR-005: Export & Print
- Export calculations to CSV format
- Print-friendly payment breakup display

---

## 3. Software Requirements Specification (SRS)

### 3.1 System Architecture
- **Frontend Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with custom design system
- **State Management:** React useState hooks
- **Build Tool:** Vite

### 3.2 Functional Requirements

#### FR-001: Configuration Panel
| Field | Type | Options/Range | Default |
|-------|------|---------------|---------|
| MSTC Payment Type | Radio | Service Charge / Transaction Fees | Service Charge |
| GST on RCM Basis | Toggle | On/Off | Off |
| GST Percentage | Dropdown | 5% / 18% | 18% |
| TCS Percentage | Dropdown | NA / 1% / 2% | NA |
| EMD Percentage | Number Input | 0-100% | 25% |
| MSTC Percent | Number Input | 0-100% | 2% |
| IT TDS | Toggle | On/Off | On |
| TCS on GST | Toggle | On/Off | On |
| TDS on S/C | Toggle | On/Off (disabled in Transaction Fees mode) | Off |
| Security Deposit Type | Dropdown | Not Applicable / Percentage / Lumpsum | Not Applicable |
| SD Percentage | Number Input | 0-100% (when Percentage selected) | 0% |

#### FR-002: Lot Input Fields
| Field | Type | Validation |
|-------|------|------------|
| Lot No. | Auto-generated | Read-only |
| Quantity | Number | ≥ 0, required |
| Bid Value | Number | ≥ 0, required |
| Penalty % | Number | 0-100% |
| SD (Security Deposit) | Number | Conditional display based on config |

#### FR-003: Lot Details Table Display
| Column | Description |
|--------|-------------|
| Lot No. | Auto-incremented lot identifier |
| Qty | Quantity input |
| Bid | Bid value per unit |
| Material | Calculated: Qty × Bid |
| Penalty % | Penalty percentage input |
| Penalty | Calculated penalty amount |
| SD | Security deposit (conditional) |
| GST % | GST percentage display |
| GST | Calculated GST amount |
| TCS % | TCS percentage display |
| TCS | Calculated TCS amount |
| Total | Total payment amount |

#### FR-004: Breakdown Table Structure
| Row | Description |
|-----|-------------|
| Non-adjustable Security Deposit | SD Amount (non-adjustable) |
| EMD | Earnest Money Deposit |
| Balance Payment to Seller | Remaining seller payment |
| MSTC Service Charge / Transaction Fees | Based on payment mode |
| MSTC IT TDS | Income Tax TDS |
| MSTC TCS on GST | TCS on GST amount |
| Total | Grand total payable |

**Columns:** Lot 1, Lot 2, ..., Lot N, Total, Breakup

**Breakup Column Structure:**
- Rows 1-3 merged: Seller Payment (SD + EMD + Balance Payment)
- Rows 4-6 merged: MSTC Payment (Service Charge/Transaction Fees + IT TDS + TCS on GST)

### 3.3 Non-Functional Requirements

#### NFR-001: Performance
- All calculations must update in real-time (< 100ms)
- UI must remain responsive during calculations

#### NFR-002: Usability
- Responsive design for desktop and tablet
- Print-optimized layout
- Clear error indicators for invalid inputs

#### NFR-003: Maintainability
- Modular component architecture
- Centralized calculation logic
- Type-safe implementations with TypeScript

---

## 4. Calculation Logic

### 4.1 Base Calculations (Per Lot)

```
Material Value = Quantity × Bid Value

Penalty = Material Value × Penalty% / 100

GST = Material Value × GST% / 100
     (GST = 0 if RCM toggle is enabled)

TCS = (Material Value + GST) × TCS% / 100

SD Amount:
  - If "Not Applicable": 0
  - If "Percentage": Material Value × SD% / 100
  - If "Lumpsum": User-entered amount

Total Payment = Material Value + Penalty + GST + TCS + SD Amount

EMD = Material Value × EMD% / 100
```

### 4.2 MSTC Charges & Taxes

```
Service Charge (with GST) = Material Value × MSTC% / 100 × 1.18
Service Charge (without GST) = Material Value × MSTC% / 100
Transaction Fees = Material Value × MSTC% / 100 × 1.18

TDS on Service Charge = Service Charge (without GST) × 2%
                        (Only if TDS on S/C toggle enabled)

IT TDS = Material Value × 0.1%
         (Only if IT TDS toggle enabled)

TCS on GST = Material Value × 1%
             (Only if TCS on GST toggle enabled)
```

### 4.3 Payment Logic - Mode 1: Service Charge Mode

```
MSTC Payment = Service Charge (with GST) + IT TDS + TCS on GST − TDS on S/C

Balance Payment = Total Payment − EMD − MSTC Payment

Seller Payment = EMD + Balance Payment

Grand Total = MSTC Payment + Seller Payment
```

### 4.4 Payment Logic - Mode 2: Transaction Fees Mode

```
MSTC Payment = Transaction Fees + IT TDS + TCS on GST

Balance Payment = Total Payment − EMD − MSTC Payment + Transaction Fees

Seller Payment = EMD + Balance Payment

Grand Total = MSTC Payment + Seller Payment
```

### 4.5 Breakup Groups

```
Seller Payment Group = SD Amount + EMD + Balance Payment

MSTC Payment Group = Service Charge/Transaction Fees + IT TDS + TCS on GST
```

---

## 5. User Interface Specifications

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER: APCM Title + Theme Toggle + Action Buttons      │
├─────────────────────────────────────────────────────────┤
│ CONFIGURATION PANEL (Collapsible)                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ MSTC Payment Type | GST Settings | Tax Toggles      │ │
│ │ EMD% | MSTC% | Security Deposit Settings            │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ LOT DETAILS TABLE                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Lot | Qty | Bid | Material | Penalty | SD | GST ... │ │
│ │  1  │     │     │          │         │    │         │ │
│ │  2  │     │     │          │         │    │         │ │
│ │                    [+ Add Row]                      │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ PAYMENT BREAKDOWN TABLE                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Component              │ Lot 1 │ Total │ Breakup    │ │
│ │ SD Amount              │       │       │ ┌────────┐ │ │
│ │ EMD                    │       │       │ │ Seller │ │ │
│ │ Balance Payment        │       │       │ │Payment │ │ │
│ │ MSTC S/C or Trans Fees │       │       │ ├────────┤ │ │
│ │ MSTC IT TDS            │       │       │ │  MSTC  │ │ │
│ │ MSTC TCS on GST        │       │       │ │Payment │ │ │
│ │ Total                  │       │       │ └────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ FOOTER: Application credits                             │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Color Theme
- **Primary:** Navy Blue (#1e3a5f)
- **Accent:** Teal (#14b8a6)
- **Background:** Light gray gradients
- **Text:** Dark gray for readability

### 5.3 Responsive Breakpoints
- Desktop: ≥ 1024px
- Tablet: 768px - 1023px
- Mobile: < 768px (scrollable tables)

---

## 6. Data Dictionary

### 6.1 Configuration Object

| Field | Type | Description |
|-------|------|-------------|
| mstcPaymentType | 'serviceCharge' \| 'transactionFees' | Payment mode selection |
| gstOnRcm | 0 \| 1 | RCM toggle (0=off, 1=on) |
| gstPercent | number | GST percentage (5 or 18) |
| tcsPercent | number | TCS percentage (0, 1, or 2) |
| emdPercent | number | EMD percentage |
| mstcPercent | number | MSTC service charge/transaction fees percentage |
| itTdsEnabled | boolean | IT TDS toggle |
| tcsOnGstEnabled | boolean | TCS on GST toggle |
| tdsEnabled | boolean | TDS on Service Charge toggle |
| securityDepositType | 'notApplicable' \| 'percentage' \| 'lumpsum' | SD mode |
| sdPercent | number | SD percentage (when percentage mode) |

### 6.2 Lot Object

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique lot identifier |
| name | string | Lot display name |
| quantity | number | Quantity of items |
| bidValue | number | Bid value per unit |
| penaltyPercent | number | Penalty percentage |
| sdValue | number | Security deposit value (input) |

### 6.3 Calculated Lot Fields

| Field | Type | Description |
|-------|------|-------------|
| materialValue | number | Quantity × Bid Value |
| penalty | number | Material Value × Penalty% / 100 |
| gst | number | Material Value × GST% / 100 (0 if RCM) |
| tcs | number | (Material Value + GST) × TCS% / 100 |
| sdAmount | number | Calculated SD based on config |
| total | number | Sum of all payment components |
| emd | number | Material Value × EMD% / 100 |
| serviceChargeWithoutGst | number | Material Value × MSTC% / 100 |
| serviceCharge | number | Service Charge × 1.18 |
| tds | number | Service Charge (w/o GST) × 2% |
| itTds | number | Material Value × 0.1% |
| tcsOnGst | number | Material Value × 1% |

### 6.4 Breakdown Object

| Field | Type | Description |
|-------|------|-------------|
| sdAmount | number | Security deposit amount |
| emd | number | EMD amount |
| balancePayment | number | Balance to seller |
| mstcCharge | number | Service charge or transaction fees |
| itTds | number | IT TDS amount |
| tcsOnGst | number | TCS on GST amount |
| sellerPaymentTotal | number | EMD + Balance Payment |
| mstcPayment | number | Total MSTC payment |
| grandTotal | number | Total payable amount |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Analyst | | | |
| Technical Lead | | | |
| Project Manager | | | |

---

**End of Document**

*Auction Payment Computation Module (APCM) • Built for accurate lot-based payment calculations - designed by S@N*
