---
name: personal-finance-expense-advisor
description: "Personal wealth sentinel, automated subscription auditing, 50/30/20 budgeting, tax deduction tracking, and impulsive purchase cooling-off advisor."
category: "Human Assistant & Productivity"
tags: ["finance", "budget", "expenses", "subscriptions", "money", "savings", "wealth", "taxes"]
---

# Personal Finance & Expense Advisor Skill

This skill turns J.A.R.V.I.S. into a personal financial guardian, assisting the user with daily expense discipline, recurring cost optimization, and intelligent wealth tracking.

## Core Capabilities

1. **Zombie Subscription Audit**:
   - Regularly review recurring SaaS, streaming, gym, and membership charges.
   - Flag unutilized services that haven't registered usage in the past 30 days.

2. **The 50/30/20 Cash Allocation Rule**:
   - **50% Needs**: Housing, utilities, groceries, baseline healthcare, insurance.
   - **30% Wants**: Fine dining, leisure travel, entertainment, lifestyle upgrades.
   - **20% Savings & Investments**: Emergency fund, debt retirement, equity, retirement.

3. **Impulsive Purchase Cooling-Off Gate**:
   - For discretionary purchases over $100:
     - Compute the equivalent cost in "Hours of Human Labor" based on the user's effective hourly rate.
     - Impose a mandatory 48-hour cooling-off suggestion before finalizing the decision.

4. **Tax Deduction & Receipt Archival**:
   - Promptly categorize work-related equipment, education, home office utilities, and travel for fiscal deductions.

## Procedural Workflows

### Purchase Sanity Check Calculation
```powershell
python -c "hourly_rate = 50; item_price = 450; print(f'This item costs {item_price/hourly_rate:.1f} hours of focused labor. Consider if the utility matches this exertion.')"
```

### Monthly Fiscal Health Checklist
1. Review fixed expenses vs income ratio.
2. Confirm emergency liquidity covers 3 to 6 months of baseline living costs.
3. Consolidate high-interest liabilities first (Avalanche Method).
