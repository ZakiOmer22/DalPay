# DalPay Tax Calculator - Calculation Methodology

## Overview

The Tax Calculator implements the Somaliland tax framework with real tax rates, progressive brackets, and proper accounting for different income sources. All amounts are in Somaliland Shillings (SOS).

---

## Tax Types & Rates

### 1. Income Tax (Progressive Brackets)

Somaliland implements a progressive income tax system with three brackets:

| Bracket | Income Range | Tax Rate |
|---------|--------------|----------|
| Tier 1  | 0 - 3,600,000 SOS | 5% |
| Tier 2  | 3,600,000 - 7,200,000 SOS | 10% |
| Tier 3  | 7,200,000+ SOS | 15% |

**Calculation Formula:**
```
Income Tax = (Min(Income, 3.6M) × 0.05) 
           + (Min(Max(Income - 3.6M, 0), 3.6M) × 0.10) 
           + (Max(Income - 7.2M, 0) × 0.15)
```

**Example:**
- Annual Income: 10,000,000 SOS
- Tier 1: 3,600,000 × 0.05 = 180,000 SOS
- Tier 2: 3,600,000 × 0.10 = 360,000 SOS
- Tier 3: 2,800,000 × 0.15 = 420,000 SOS
- **Total Income Tax: 960,000 SOS (9.6% effective rate)**

### 2. Business/Trading Tax

Flat tax on net business profit after all legitimate business expenses.

| Category | Rate |
|----------|------|
| Business Tax Rate | 12% |

**Calculation Formula:**
```
Business Tax = Net Business Profit × 0.12
```

**Example:**
- Business Profit: 5,000,000 SOS
- Business Tax = 5,000,000 × 0.12 = 600,000 SOS

**Applicable To:**
- Retail merchants and traders
- Service providers
- Manufacturing businesses
- Transportation operators

### 3. Property Tax

Annual tax on real estate value including land and structures.

| Category | Rate |
|----------|------|
| Property Tax Rate | 2.5% per annum |

**Calculation Formula:**
```
Annual Property Tax = Total Property Value × 0.025
```

**Example:**
- Property Value: 50,000,000 SOS
- Annual Property Tax = 50,000,000 × 0.025 = 1,250,000 SOS

**Applicable To:**
- Residential properties
- Commercial real estate
- Land ownership

### 4. Consumption/Value Added Tax (VAT)

Standard VAT applied to goods and services.

| Category | Rate |
|----------|------|
| Standard VAT Rate | 8% |

**Calculation Formula:**
```
Consumption Tax = Estimated Annual Consumption × 0.08
```

**Example:**
- Annual Consumption: 2,000,000 SOS
- Consumption Tax = 2,000,000 × 0.08 = 160,000 SOS

**Applicable To:**
- Purchased goods and services
- Imports
- Commercial transactions

---

## Effective Tax Rate Calculation

The effective tax rate shows the overall percentage of total income/assets subject to tax.

**Formula:**
```
Effective Tax Rate = (Total Tax Liability / Total Taxable Base) × 100
```

**Where:**
```
Total Taxable Base = Income 
                   + Business Profit (if included)
                   + Property Value (if included)
                   + Consumption (if included)
```

**Example:**
- Income: 10,000,000 SOS → Income Tax: 960,000 SOS
- Business: 5,000,000 SOS → Business Tax: 600,000 SOS
- Property: 50,000,000 SOS → Property Tax: 1,250,000 SOS
- Consumption: 2,000,000 SOS → VAT: 160,000 SOS

Total Taxable Base: 67,000,000 SOS
Total Tax: 2,970,000 SOS
**Effective Rate: 4.43%**

---

## Monthly Payment Breakdown

For payment planning, the calculator divides annual liability by 12:

**Formula:**
```
Monthly Payment = Annual Tax Liability ÷ 12
```

This provides an average monthly amount, though actual payment schedules may vary by regulation.

---

## Data Integration with Backend

### User Profile Data

The calculator auto-populates from the authenticated user's tax profile:

```typescript
interface TaxpayerProfile {
  monthly_income: number;      // Monthly declared income (SOS)
  business_type?: string;      // Type of business
  property_value?: number;     // Total property value (SOS)
}
```

**Backend Endpoint:** `GET /api/v1/tax/profile`

On page load, the calculator:
1. Fetches the user's profile
2. Multiplies monthly income × 12 for annual income
3. Pre-fills property value if available
4. Displays monthly equivalent

### Payment Redirect

When the user clicks "Proceed to Pay", they are redirected to:
```
/taxpayer/pay
```

This page will display official tax assessments from the backend and allow actual payment initiation.

---

## Validation Rules

The calculator enforces the following:

| Field | Validation |
|-------|-----------|
| Income | Must be ≥ 0 |
| Business Profit | Must be ≥ 0, enabled only if checkbox selected |
| Property Value | Must be ≥ 0, enabled only if checkbox selected |
| Consumption | Must be ≥ 0, enabled only if checkbox selected |
| All amounts | Increments by 10,000 SOS (prevents non-SOS values) |

---

## Key Features

### Real-Time Calculation
As the user adjusts input values, the calculator immediately:
- Recalculates all tax categories
- Updates the effective tax rate
- Recalculates monthly payment

### Progressive Tax Transparency
The income tax breakdown shows the user exactly which bracket each portion falls into, promoting understanding of Somaliland's progressive system.

### Toggleable Tax Categories
The user can include/exclude business, property, and consumption taxes to see different scenarios.

### Personal Profile Integration
The calculator pre-fills with the user's actual profile data from the backend, making the estimate more personalized.

### Clear Warnings
The calculator includes disclaimers that this is an estimate only, and actual assessments are determined by the government.

---

## Assumptions & Limitations

1. **Income Tax**: Assumes all income is subject to the stated brackets; does not account for:
   - Personal deductions (standard deduction if applicable)
   - Tax credits or exemptions
   - Carryforward losses

2. **Business Tax**: Assumes the profit figure provided is already the net profit after expenses.

3. **Property Tax**: Uses a flat 2.5% rate; may vary by property classification or location.

4. **Consumption Tax**: Estimated based on user input; actual VAT liability depends on purchases made.

5. **Currency Conversion**: All calculations in SOS. USD equivalents shown are informational only (1 USD ≈ 50,000 SOS estimated).

---

## Audit & Compliance

All tax calculations performed client-side for speed, but:
- Official tax liabilities are determined by the DalPay backend after official assessment
- Users should treat this calculator as a planning tool
- Actual taxes owed are shown in the "View Your Official Tax Assessments" section

---

## Future Enhancements

Potential improvements pending regulatory updates:

1. **Deductions & Credits**: Add standard deductions, personal allowances, and tax credits
2. **Installment Plans**: Show payment schedules and interest on late payments
3. **Tax Scenarios**: "What-if" scenarios (raise income by 50%, purchase property, start business)
4. **Export**: Generate a PDF report of the calculation
5. **Comparison**: Compare current year vs. previous year liability

---

**Last Updated:** May 28, 2026  
**Calculator Version:** 2.0 (Professional, Backend-Integrated)  
**Maintainer:** DalPay Development Team