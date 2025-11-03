# Invoice API Contracts

This directory contains the OpenAPI specification for the invoice-related endpoints used by the Invoice Financial Metrics Dashboard feature.

## Files

- **invoices-api.yaml**: OpenAPI 3.0.3 specification for the `GET /api/v1/invoices/` endpoint

## Usage

These contracts define the API interface between the React Native mobile frontend and the FastAPI backend. The contracts serve as:

1. **Documentation**: Clear specification of request/response formats
2. **Type Generation**: Can be used to generate TypeScript types (future enhancement)
3. **Testing**: Backend API can be validated against this specification
4. **Integration Guide**: Frontend developers can reference expected data structures

## Endpoint

### GET /api/v1/invoices/

Retrieves all invoices for financial metrics calculation.

**Authentication**: Required (JWT Bearer token)

**Response**: Array of Invoice objects

**Key Fields for Metrics Calculation**:
- `total_amount_cents`: Used for all revenue calculations
- `status`: Used to categorize invoices (paid, unpaid, pending)

## Status Values

Primary statuses (for metrics calculation):
- `"paid"`: Invoice has been fully paid → contributes to Paid Revenue
- `"unpaid"`: Invoice has not been paid → contributes to Outstanding Revenue
- `"pending"`: Payment is in progress → contributes to Outstanding Revenue

Other statuses may exist in the API response but are not used for the three primary metrics.

## Integration Notes

- All amounts are in cents (integer) and must be converted to dollars for display
- Optional fields may be null, undefined, or missing - frontend must handle gracefully
- API may return additional fields not specified in schema - frontend should ignore unknown fields
- Empty array response indicates no invoices exist (all metrics should be zero)

## Related Documentation

- [Data Model](./../data-model.md): Detailed entity definitions and validation rules
- [Quickstart Guide](./../quickstart.md): Implementation integration guide

