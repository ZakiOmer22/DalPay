// modules/ledger/ledger.service.ts
import pool from "../../config/database";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface LedgerEntry {
  userId: string;
  amount: number;
  type: "debit" | "credit";
  account: string; // 'tax_receivable', 'cash', 'revenue', etc.
  reference: string; // payment_id, assessment_id, dispute_id
  description: string;
}

export class LedgerService {
  /**
   * Record a double-entry transaction.
   * Every financial event must have at least one debit and one credit of equal sum.
   * This function records all entries atomically.
   */
  async recordEntries(entries: LedgerEntry[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Validate that debits equal credits
      const totalDebit = entries
        .filter((e) => e.type === "debit")
        .reduce((sum, e) => sum + e.amount, 0);
      const totalCredit = entries
        .filter((e) => e.type === "credit")
        .reduce((sum, e) => sum + e.amount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        throw new AppError(
          "Ledger entries must balance (debits = credits)",
          400,
        );
      }

      for (const entry of entries) {
        await client.query(
          `INSERT INTO ledger_entries
           (user_id, amount, type, account, reference, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            entry.userId,
            entry.amount,
            entry.type,
            entry.account,
            entry.reference,
            entry.description,
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get ledger for a specific user or all users (admin).
   */
  async getLedger(userId?: string, limit = 50, offset = 0) {
    let query = "SELECT * FROM ledger_entries";
    const params: any[] = [];
    if (userId) {
      query += " WHERE user_id = $1";
      params.push(userId);
    }
    query +=
      " ORDER BY created_at DESC LIMIT $" +
      (params.length + 1) +
      " OFFSET $" +
      (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get balance for a specific account (e.g., to verify cash balance).
   */
  async getAccountBalance(account: string): Promise<number> {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS balance
       FROM ledger_entries
       WHERE account = $1`,
      [account],
    );
    return parseFloat(result.rows[0].balance);
  }

  async verifyBalance(): Promise<boolean> {
    const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS total_debit,
      COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS total_credit
    FROM ledger_entries
  `);
    const { total_debit, total_credit } = result.rows[0];
    return Math.abs(parseFloat(total_debit) - parseFloat(total_credit)) < 0.001;
  }
}
