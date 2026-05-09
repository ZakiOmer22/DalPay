// modules/tax/tax-rule.service.ts
import pool from '../../config/database';
import logger from '../../utils/logger';

interface TaxBracket {
  min: number;
  max: number;
  rate: number; // percentage
}

interface TaxRule {
  type: string;           // 'income_tax', 'business_tax', 'property_tax'
  bracket?: TaxBracket[];
  fixed?: number;         // fixed amount or rate
}

const TAX_RULES: TaxRule[] = [
  {
    type: 'income_tax',
    bracket: [
      { min: 0, max: 200, rate: 0 },
      { min: 201, max: 1000, rate: 5 },
      { min: 1001, max: 5000, rate: 10 },
      { min: 5001, max: Infinity, rate: 15 },
    ],
  },
  {
    type: 'business_tax',
    fixed: 25, // small businesses; could be enhanced by business_type
  },
  {
    type: 'property_tax',
    fixed: 0.005, // 0.5% of property value annually
  },
];

export class TaxRuleService {
  async computeTaxes(userId: string, taxYear: number): Promise<{
    taxType: string;
    amount: number;
    dueDate: string;
  }[]> {
    const profile = await pool.query(
      'SELECT monthly_income, business_type, property_value FROM taxpayer_profiles WHERE user_id = $1',
      [userId]
    );

    if (profile.rows.length === 0) return [];

    const p = profile.rows[0];
    const assessments: any[] = [];
    const dueDate = new Date(taxYear, 11, 31).toISOString().split('T')[0];

    // Income tax
    if (p.monthly_income) {
      const annualIncome = parseFloat(p.monthly_income) * 12;
      const incomeRule = TAX_RULES.find(r => r.type === 'income_tax')!;
      let taxAmount = 0;
      for (const bracket of incomeRule.bracket!) {
        if (annualIncome > bracket.min && annualIncome <= bracket.max) {
          taxAmount = (annualIncome * bracket.rate) / 100;
          break;
        }
      }
      if (taxAmount > 0) {
        assessments.push({
          taxType: 'income_tax',
          amount: Math.round(taxAmount * 100) / 100,
          dueDate,
        });
      }
    }

    // Business tax
    if (p.business_type) {
      const businessRule = TAX_RULES.find(r => r.type === 'business_tax')!;
      assessments.push({
        taxType: 'business_tax',
        amount: businessRule.fixed!,
        dueDate,
      });
    }

    // Property tax
    if (p.property_value) {
      const propertyRule = TAX_RULES.find(r => r.type === 'property_tax')!;
      const amount = parseFloat(p.property_value) * propertyRule.fixed!;
      assessments.push({
        taxType: 'property_tax',
        amount: Math.round(amount * 100) / 100,
        dueDate,
      });
    }

    return assessments;
  }

  async generateAssessmentsForUser(userId: string, taxYear: number, triggeredBy?: string): Promise<void> {
    const computed = await this.computeTaxes(userId, taxYear);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Remove old auto‑generated unpaid assessments for this year (idempotent)
      await client.query(
        `DELETE FROM tax_assessments
         WHERE user_id = $1 AND year = $2 AND auto_generated = TRUE AND status = 'unpaid'`,
        [userId, taxYear]
      );
      for (const item of computed) {
        await client.query(
          `INSERT INTO tax_assessments
           (user_id, tax_type, amount, year, due_date, status, auto_generated, generated_by)
           VALUES ($1, $2, $3, $4, $5, 'unpaid', TRUE, $6)`,
          [userId, item.taxType, item.amount, taxYear, item.dueDate, triggeredBy || null]
        );
      }
      await client.query('COMMIT');
      logger.info(`Generated ${computed.length} tax assessments for user ${userId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async generateAllAssessments(taxYear: number, triggeredBy: string): Promise<number> {
    const users = await pool.query(`SELECT id FROM users WHERE role = 'taxpayer'`);
    let count = 0;
    for (const user of users.rows) {
      try {
        await this.generateAssessmentsForUser(user.id, taxYear, triggeredBy);
        count++;
      } catch (err) {
        logger.error('Failed to generate assessment for user', { userId: user.id, error: err });
      }
    }
    return count;
  }
}