// modules/ussd/ussd.service.ts
import pool from '../../config/database';
import { hashField } from '../../utils/encryption';
import { PaymentService } from '../payment/payment.service';
import { TaxService } from '../tax/tax.service';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

interface USSDState {
  sessionId: string;
  userId: string;
  phoneNumber: string;
  state: string;
  data?: any;
}

class USSDSessionStore {
  private sessions = new Map<string, USSDState>();

  get(sessionId: string): USSDState | undefined {
    return this.sessions.get(sessionId);
  }

  set(sessionId: string, state: USSDState): void {
    this.sessions.set(sessionId, state);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export class USSDService {
  private sessionStore = new USSDSessionStore();
  private paymentService = new PaymentService();
  private taxService = new TaxService();

  async processRequest(
    phoneNumber: string,
    text: string,
    sessionId?: string
  ): Promise<{ sessionId: string; response: string; end: boolean }> {
    const cleanedText = text.trim();

    // New session (no sessionId or start codes)
    if (!sessionId || ['*888#', '*123#', '*800#'].includes(cleanedText)) {
      return this.startNewSession(phoneNumber);
    }

    const session = this.sessionStore.get(sessionId);
    if (!session) {
      // Session expired or invalid, start fresh
      return this.startNewSession(phoneNumber);
    }

    try {
      return await this.handleState(session, cleanedText);
    } catch (error) {
      logger.error('USSD state error', { error, session });
      return {
        sessionId: session.sessionId,
        response: 'An error occurred. Please try again later.',
        end: true,
      };
    }
  }

  private async startNewSession(phoneNumber: string) {
    const phoneHash = hashField(phoneNumber);
    const userResult = await pool.query(
      'SELECT id FROM users WHERE phone_hash = $1',
      [phoneHash]
    );

    const sessionId = this.generateSessionId();

    if (userResult.rows.length === 0) {
      return {
        sessionId,
        response: 'Welcome to DalPay. Please register at www.dalpay.gov.so to use this service.',
        end: true,
      };
    }

    const userId = userResult.rows[0].id;
    const state: USSDState = { sessionId, userId, phoneNumber, state: 'MAIN' };
    this.sessionStore.set(sessionId, state);

    const menu = 'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
    return { sessionId, response: menu, end: false };
  }

  private async handleState(session: USSDState, text: string) {
    switch (session.state) {
      case 'MAIN': return this.handleMainMenu(session, text);
      case 'CHECK_BALANCE': return this.handleCheckBalance(session, text);
      case 'PAY_TAX_SELECT_TYPE': return this.handlePayTaxSelectType(session, text);
      case 'PAY_TAX_ENTER_AMOUNT': return this.handlePayTaxEnterAmount(session, text);
      case 'PAY_TAX_CONFIRM': return this.handlePayTaxConfirm(session, text);
      case 'STATEMENT': return this.handleStatement(session, text);
      default: return this.startNewSession(session.phoneNumber);
    }
  }

  private async handleMainMenu(session: USSDState, text: string) {
    switch (text) {
      case '1':
        session.state = 'CHECK_BALANCE';
        this.sessionStore.set(session.sessionId, session);
        const balance = await this.getBalanceText(session.userId);
        return { sessionId: session.sessionId, response: balance, end: false };
      case '2':
        session.state = 'PAY_TAX_SELECT_TYPE';
        this.sessionStore.set(session.sessionId, session);
        return {
          sessionId: session.sessionId,
          response: 'Select Tax Type:\n1. Income Tax\n2. Business Tax\n3. Property Tax\n0. Back',
          end: false,
        };
      case '3':
        session.state = 'STATEMENT';
        this.sessionStore.set(session.sessionId, session);
        const statement = await this.getStatementText(session.userId);
        return { sessionId: session.sessionId, response: statement, end: false };
      case '4':
        this.sessionStore.delete(session.sessionId);
        return { sessionId: session.sessionId, response: 'Thank you for using DalPay. Goodbye.', end: true };
      default:
        return {
          sessionId: session.sessionId,
          response: 'Invalid option. Please reply with 1, 2, 3, or 4.',
          end: false,
        };
    }
  }

  private async getBalanceText(userId: string) {
    const assessments = await pool.query(
      `SELECT amount, tax_type, status FROM tax_assessments
       WHERE user_id = $1 AND status IN ('unpaid','partially_paid','overdue')`,
      [userId]
    );
    const totalDue = assessments.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    if (totalDue === 0) {
      return 'Your Current Tax Balance:\nYou have no outstanding taxes.\n0. Back';
    }
    let text = 'Your Current Tax Balance:\n';
    for (const row of assessments.rows) {
      text += `${row.tax_type}: ${row.amount} SOS\n`;
    }
    text += `Total Due: ${totalDue} SOS\n0. Back`;
    return text;
  }

  private async handleCheckBalance(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      this.sessionStore.set(session.sessionId, session);
      const menu = 'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }
    return { sessionId: session.sessionId, response: 'Invalid option. Reply 0 to go back.', end: false };
  }

  private async handlePayTaxSelectType(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      this.sessionStore.set(session.sessionId, session);
      const menu = 'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }

    const taxTypeMap: Record<string, string> = {
      '1': 'income_tax',
      '2': 'business_tax',
      '3': 'property_tax',
    };
    const taxType = taxTypeMap[text];
    if (!taxType) {
      return {
        sessionId: session.sessionId,
        response: 'Invalid tax type. Reply 1-3 or 0 to go back.',
        end: false,
      };
    }

    const assessmentResults = await pool.query(
      `SELECT id, amount, tax_type, year, due_date FROM tax_assessments
       WHERE user_id = $1 AND tax_type = $2 AND status IN ('unpaid','partially_paid')
       ORDER BY due_date LIMIT 1`,
      [session.userId, taxType]
    );

    if (assessmentResults.rows.length === 0) {
      return {
        sessionId: session.sessionId,
        response: `No unpaid ${taxType.replace('_', ' ')} assessments found.\n0. Back`,
        end: false,
      };
    }

    const assessment = assessmentResults.rows[0];
    session.state = 'PAY_TAX_ENTER_AMOUNT';
    session.data = {
      assessmentId: assessment.id,
      taxType: assessment.tax_type,
      maxAmount: parseFloat(assessment.amount),
    };
    this.sessionStore.set(session.sessionId, session);

    return {
      sessionId: session.sessionId,
      response: `${assessment.tax_type} - Amount due: ${assessment.amount} SOS\nEnter Amount to Pay (SOS):\n0. Cancel`,
      end: false,
    };
  }

  private async handlePayTaxEnterAmount(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      delete session.data;
      this.sessionStore.set(session.sessionId, session);
      const menu = 'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      return { sessionId: session.sessionId, response: 'Invalid amount. Enter a valid number or 0 to cancel.', end: false };
    }

    const { maxAmount } = session.data;
    if (amount > maxAmount) {
      return { sessionId: session.sessionId, response: `Amount exceeds the due amount of ${maxAmount} SOS. Enter again or 0 to cancel.`, end: false };
    }

    session.data.amount = amount;
    session.state = 'PAY_TAX_CONFIRM';
    this.sessionStore.set(session.sessionId, session);

    return {
      sessionId: session.sessionId,
      response: `Confirm payment of ${amount} SOS?\n1. Confirm\n0. Cancel`,
      end: false,
    };
  }

  private async handlePayTaxConfirm(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      delete session.data;
      this.sessionStore.set(session.sessionId, session);
      const menu = 'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }

    if (text === '1') {
      try {
        const { assessmentId, amount } = session.data;
        const payment = await this.paymentService.initiatePayment({
          userId: session.userId,
          assessmentId,
          amount,
          providerId: 'zaad',
          phoneNumber: session.phoneNumber,
          ipAddress: 'ussd',
        });

        const successMsg = `Payment of ${amount} SOS accepted.\nRef: ${payment.transaction_reference}\nThank you!`;
        this.sessionStore.delete(session.sessionId);
        return { sessionId: session.sessionId, response: successMsg, end: true };
      } catch (error: any) {
        logger.error('USSD payment failed', { error });
        return {
          sessionId: session.sessionId,
          response: 'Payment failed. Please try again later.',
          end: true,
        };
      }
    }

    return { sessionId: session.sessionId, response: 'Invalid choice. Reply 1 to confirm or 0 to cancel.', end: false };
  }

  private async getStatementText(userId: string): Promise<string> {
    const summary = await this.taxService.getTaxpayerSummary(userId);
    return `Tax Summary:\nTotal Due: ${summary.assessments.total_due} SOS\nPending: ${summary.assessments.pending}\nPaid: ${summary.assessments.paid}\nOverdue: ${summary.assessments.overdue}\n\n0. Back`;
  }

  private async handleStatement(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      this.sessionStore.set(session.sessionId, session);
      const menu = 'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }
    return { sessionId: session.sessionId, response: 'Invalid option. Reply 0 to go back.', end: false };
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}