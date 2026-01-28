# Reports API Documentation

## Overview

The Reports API provides comprehensive analytics and reporting endpoints for the Yeng Shipping system. All endpoints return JSON data and require authentication.

## Base URL

```
http://localhost:3000/reports
```

## Endpoints

### 1. Dashboard Statistics

Get key metrics for the admin dashboard overview.

**Endpoint:** `GET /reports/dashboard`

**Response:**
```json
{
  "totalShipments": {
    "value": 12482,
    "growth": 14.0  // % growth vs last month
  },
  "revenue": {
    "value": 84320.50,
    "growth": 8.0
  },
  "activeDeliveries": {
    "value": 1540,
    "readyForPickup": 42
  },
  "pendingTasks": {
    "value": 84,
    "urgentIssues": 12
  }
}
```

---

### 2. Shipping Volume

Get shipment volume by day for a specified period.

**Endpoint:** `GET /reports/shipping-volume`

**Query Parameters:**
- `days` (optional): Number of days to include (default: 7)

**Example:** `GET /reports/shipping-volume?days=7`

**Response:**
```json
[
  {
    "day": "Mon",
    "count": 45,
    "date": "2026-01-21"
  },
  {
    "day": "Tue",
    "count": 52,
    "date": "2026-01-22"
  },
  // ... more days
]
```

---

### 3. Revenue Report

Get detailed revenue report with breakdown by payment method.

**Endpoint:** `GET /reports/revenue`

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Example:** `GET /reports/revenue?startDate=2026-01-01&endDate=2026-01-31`

**Response:**
```json
{
  "totalRevenue": 15420.75,
  "totalTransactions": 145,
  "byMethod": {
    "CASH": 12500.00,
    "MONCASH": 2420.75,
    "CARD": 500.00
  },
  "payments": [
    {
      "id": "uuid",
      "amount": 125.50,
      "method": "CASH",
      "date": "2026-01-28T14:30:00Z",
      "trackingNumber": "YNG-45821673",
      "customerName": "Jean Pierre"
    }
    // ... more payments
  ]
}
```

---

### 4. Shipment Status Breakdown

Get count of parcels by status.

**Endpoint:** `GET /reports/status-breakdown`

**Response:**
```json
[
  {
    "status": "PENDING",
    "count": 25
  },
  {
    "status": "IN_TRANSIT_USA",
    "count": 150
  },
  {
    "status": "ARRIVED_HAITI",
    "count": 75
  }
  // ... more statuses
]
```

---

### 5. Top Customers

Get customers ranked by shipment count and total spending.

**Endpoint:** `GET /reports/top-customers`

**Query Parameters:**
- `limit` (optional): Number of customers to return (default: 10)

**Example:** `GET /reports/top-customers?limit=5`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Jean Pierre",
    "email": "jean.pierre@example.com",
    "customAddress": "YENGSHIPPINGP-Jean-4582",
    "totalShipments": 45,
    "totalSpent": 2250.75
  }
  // ... more customers
]
```

---

### 6. Monthly Statistics

Get comprehensive statistics for a specific month.

**Endpoint:** `GET /reports/monthly`

**Query Parameters:**
- `year` (required): Year (e.g., 2026)
- `month` (required): Month (1-12)

**Example:** `GET /reports/monthly?year=2026&month=1`

**Response:**
```json
{
  "period": {
    "year": 2026,
    "month": 1,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-01-31T23:59:59Z"
  },
  "totalShipments": 450,
  "totalRevenue": 22500.00,
  "totalPaid": 20000.00,
  "outstandingPayments": 2500.00,
  "averageShipmentValue": 50.00,
  "statusBreakdown": {
    "PENDING": 25,
    "IN_TRANSIT_USA": 100,
    "ARRIVED_HAITI": 75,
    "PICKED_UP": 250
  }
}
```

---

### 7. Customer Growth

Get customer acquisition trend over time.

**Endpoint:** `GET /reports/customer-growth`

**Query Parameters:**
- `months` (optional): Number of months to include (default: 6)

**Example:** `GET /reports/customer-growth?months=6`

**Response:**
```json
[
  {
    "month": "Aug 2025",
    "newCustomers": 45,
    "date": "2025-08-01T00:00:00Z"
  },
  {
    "month": "Sep 2025",
    "newCustomers": 52,
    "date": "2025-09-01T00:00:00Z"
  }
  // ... more months
]
```

---

### 8. Export Parcels

Export parcel data for CSV/Excel generation.

**Endpoint:** `GET /reports/export/parcels`

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `status` (optional): Filter by status

**Example:** `GET /reports/export/parcels?status=ARRIVED_HAITI`

**Response:**
```json
[
  {
    "trackingNumber": "YNG-45821673",
    "barcode": "123456789",
    "customerName": "Jean Pierre",
    "customerEmail": "jean.pierre@example.com",
    "customAddress": "YENGSHIPPINGP-Jean-4582",
    "description": "Electronics",
    "weight": 2.5,
    "declaredValue": 500.00,
    "shippingFee": 12.50,
    "taxAmount": 1.25,
    "totalAmount": 13.75,
    "status": "ARRIVED_HAITI",
    "paymentStatus": "PENDING",
    "currentLocation": "Port-au-Prince, Haiti",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-28T14:20:00Z"
  }
  // ... more parcels
]
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get dashboard stats
const stats = await fetch('http://localhost:3000/reports/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json());

// Get revenue for January 2026
const revenue = await fetch(
  'http://localhost:3000/reports/revenue?startDate=2026-01-01&endDate=2026-01-31',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json());

// Export all parcels in Haiti
const parcels = await fetch(
  'http://localhost:3000/reports/export/parcels?status=ARRIVED_HAITI',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json());
```

### cURL

```bash
# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/reports/dashboard

# Get shipping volume for last 14 days
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/reports/shipping-volume?days=14"

# Get top 5 customers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/reports/top-customers?limit=5"
```

## Data Visualization

These endpoints are designed to power various charts and visualizations:

1. **Dashboard Stats** → KPI Cards
2. **Shipping Volume** → Bar Chart / Line Chart
3. **Revenue Report** → Pie Chart (by method) + Table
4. **Status Breakdown** → Donut Chart
5. **Top Customers** → Leaderboard Table
6. **Monthly Stats** → Multi-metric Dashboard
7. **Customer Growth** → Line Chart
8. **Export Parcels** → CSV Download / Excel Export

## Performance Notes

- All endpoints use database aggregations for optimal performance
- Date ranges are recommended for large datasets
- Export endpoint may return large payloads - consider pagination for production use
- Dashboard stats are calculated in real-time (consider caching for high-traffic scenarios)

## Error Responses

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid date format",
  "error": "Bad Request"
}
```

Common status codes:
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `500`: Internal Server Error
