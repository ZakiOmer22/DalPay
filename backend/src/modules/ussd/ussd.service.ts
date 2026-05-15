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

    // If no session and no phone number → ask for it
    if (!sessionId) {
      if (!phoneNumber || phoneNumber.trim() === '') {
        const tempSessionId = this.generateSessionId();
        const state: USSDState = {
          sessionId: tempSessionId,
          userId: '',
          phoneNumber: '',
          state: 'ENTER_PHONE',
        };
        this.sessionStore.set(tempSessionId, state);
        return {
          sessionId: tempSessionId,
          response: 'Welcome to DalPay USSD.\nPlease enter your phone number:',
          end: false,
        };
      }
      return this.startNewSession(phoneNumber);
    }

    // Existing session
    const session = this.sessionStore.get(sessionId);
    if (!session) {
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
        response:
          'Welcome to DalPay. Please register at www.dalpay.gov.so to use this service.',
        end: true,
      };
    }

    const userId = userResult.rows[0].id;
    const state: USSDState = { sessionId, userId, phoneNumber, state: 'MAIN' };
    this.sessionStore.set(sessionId, state);

    const menu =
      'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
    return { sessionId, response: menu, end: false };
  }

  private async handleState(session: USSDState, text: string) {
    switch (session.state) {
      case 'ENTER_PHONE':
        return this.handleEnterPhone(session, text);
      case 'MAIN':
        return this.handleMainMenu(session, text);
      case 'CHECK_BALANCE':
        return this.handleCheckBalance(session, text);
      case 'PAY_TAX_SELECT_TYPE':
        return this.handlePayTaxSelectType(session, text);
      case 'PAY_TAX_SELECT_PROVIDER':
        return this.handlePayTaxSelectProvider(session, text);
      case 'PAY_TAX_ENTER_AMOUNT':
        return this.handlePayTaxEnterAmount(session, text);
      case 'PAY_TAX_ENTER_PIN':
        return this.handlePayTaxEnterPin(session, text);
      case 'STATEMENT':
        return this.handleStatement(session, text);
      default:
        return this.startNewSession(session.phoneNumber);
    }
  }

  // ----------------------------------------------------------------
  // NEW: Prompt for phone number
  // ----------------------------------------------------------------
  private async handleEnterPhone(session: USSDState, text: string) {
    const phone = text.trim();
    if (!phone) {
      return {
        sessionId: session.sessionId,
        response: 'Invalid phone number. Try again:',
        end: false,
      };
    }

    const phoneHash = hashField(phone);
    const userResult = await pool.query(
      'SELECT id FROM users WHERE phone_hash = $1',
      [phoneHash]
    );

    if (userResult.rows.length === 0) {
      return {
        sessionId: session.sessionId,
        response:
          'Phone not registered. Please register at www.dalpay.gov.so',
        end: true,
      };
    }

    session.userId = userResult.rows[0].id;
    session.phoneNumber = phone;
    session.state = 'MAIN';
    this.sessionStore.set(session.sessionId, session);

    const menu =
      'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
    return { sessionId: session.sessionId, response: menu, end: false };
  }

  // ----------------------------------------------------------------
  // MAIN MENU
  // ----------------------------------------------------------------
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
          response:
            'Select Tax Type:\n1. Income Tax\n2. Business Tax\n3. Property Tax\n0. Back',
          end: false,
        };
      case '3':
        session.state = 'STATEMENT';
        this.sessionStore.set(session.sessionId, session);
        const statement = await this.getStatementText(session.userId);
        return {
          sessionId: session.sessionId,
          response: statement,
          end: false,
        };
      case '4':
        this.sessionStore.delete(session.sessionId);
        return {
          sessionId: session.sessionId,
          response: 'Thank you for using DalPay. Goodbye.',
          end: true,
        };
      default:
        return {
          sessionId: session.sessionId,
          response: 'Invalid option. Please reply with 1, 2, 3, or 4.',
          end: false,
        };
    }
  }

  // ----------------------------------------------------------------
  // BALANCE (shows remaining amount after confirmed payments)
  // ----------------------------------------------------------------
  private async getBalanceText(userId: string) {
    const assessments = await pool.query(
      `SELECT ta.id, ta.amount, ta.tax_type, ta.status,
              COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'confirmed'), 0) AS paid
       FROM tax_assessments ta
       LEFT JOIN payments p ON p.assessment_id = ta.id AND p.status = 'confirmed'
       WHERE ta.user_id = $1
         AND ta.status IN ('unpaid', 'partially_paid', 'overdue')
       GROUP BY ta.id, ta.amount, ta.tax_type, ta.status`,
      [userId]
    );

    if (assessments.rows.length === 0) {
      return 'Your Current Tax Balance:\nYou have no outstanding taxes.\n0. Back';
    }

    let text = 'Your Current Tax Balance:\n';
    let totalDue = 0;
    for (const row of assessments.rows) {
      const remaining = parseFloat(row.amount) - parseFloat(row.paid);
      totalDue += remaining;
      text += `${row.tax_type}: ${remaining} SOS\n`;
    }
    text += `Total Due: ${totalDue} SOS\n0. Back`;
    return text;
  }

  private async handleCheckBalance(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      this.sessionStore.set(session.sessionId, session);
      const menu =
        'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }
    return {
      sessionId: session.sessionId,
      response: 'Invalid option. Reply 0 to go back.',
      end: false,
    };
  }

  // ----------------------------------------------------------------
  // TAX TYPE SELECTION
  // ----------------------------------------------------------------
  private async handlePayTaxSelectType(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      this.sessionStore.set(session.sessionId, session);
      const menu =
        'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
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
    session.state = 'PAY_TAX_SELECT_PROVIDER';
    session.data = {
      assessmentId: assessment.id,
      taxType: assessment.tax_type,
      maxAmount: parseFloat(assessment.amount),
    };
    this.sessionStore.set(session.sessionId, session);

    const providers = await pool.query(
      'SELECT provider_id, provider_name FROM payment_providers WHERE is_active = true ORDER BY provider_name'
    );
    let providerList = 'Select Mobile Money Provider:\n';
    providers.rows.forEach((p, idx) => {
      providerList += `${idx + 1}. ${p.provider_name}\n`;
    });
    providerList += '0. Back';
    return { sessionId: session.sessionId, response: providerList, end: false };
  }

  // ----------------------------------------------------------------
  // PROVIDER SELECTION
  // ----------------------------------------------------------------
  private async handlePayTaxSelectProvider(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'PAY_TAX_SELECT_TYPE';
      delete session.data;
      this.sessionStore.set(session.sessionId, session);
      return {
        sessionId: session.sessionId,
        response:
          'Select Tax Type:\n1. Income Tax\n2. Business Tax\n3. Property Tax\n0. Back',
        end: false,
      };
    }

    const providers = await pool.query(
      'SELECT provider_id, provider_name FROM payment_providers WHERE is_active = true ORDER BY provider_name'
    );
    const idx = parseInt(text) - 1;
    if (isNaN(idx) || idx < 0 || idx >= providers.rows.length) {
      return {
        sessionId: session.sessionId,
        response: 'Invalid choice. Reply with number or 0 to go back.',
        end: false,
      };
    }

    const provider = providers.rows[idx];
    session.data.providerId = provider.provider_id;
    session.data.providerName = provider.provider_name;
    session.state = 'PAY_TAX_ENTER_AMOUNT';
    this.sessionStore.set(session.sessionId, session);

    return {
      sessionId: session.sessionId,
      response: `${session.data.taxType} - Amount due: ${session.data.maxAmount} SOS\nEnter Amount to Pay (SOS):\n0. Cancel`,
      end: false,
    };
  }

  // ----------------------------------------------------------------
  // AMOUNT
  // ----------------------------------------------------------------
  private async handlePayTaxEnterAmount(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'PAY_TAX_SELECT_TYPE';
      delete session.data;
      this.sessionStore.set(session.sessionId, session);
      return {
        sessionId: session.sessionId,
        response:
          'Select Tax Type:\n1. Income Tax\n2. Business Tax\n3. Property Tax\n0. Back',
        end: false,
      };
    }

    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) {
      return {
        sessionId: session.sessionId,
        response: 'Invalid amount. Enter a valid number or 0 to cancel.',
        end: false,
      };
    }

    if (amount > session.data.maxAmount) {
      return {
        sessionId: session.sessionId,
        response: `Amount exceeds the due amount of ${session.data.maxAmount} SOS. Enter again or 0 to cancel.`,
        end: false,
      };
    }

    session.data.amount = amount;
    session.state = 'PAY_TAX_ENTER_PIN';
    this.sessionStore.set(session.sessionId, session);

    return {
      sessionId: session.sessionId,
      response: `Pay ${amount} SOS via ${session.data.providerName} to ${session.phoneNumber}?\nEnter your ${session.data.providerName} PIN to confirm:\n0. Cancel`,
      end: false,
    };
  }

  // ----------------------------------------------------------------
  // PIN + PAYMENT EXECUTION (with auto-confirmation)
  // ----------------------------------------------------------------
  private async handlePayTaxEnterPin(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      delete session.data;
      this.sessionStore.set(session.sessionId, session);
      const menu =
        'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }

    const pin = text.trim();
    if (!/^\d{4}$/.test(pin)) {
      return {
        sessionId: session.sessionId,
        response: 'Invalid PIN. Enter your 4-digit PIN or 0 to cancel.',
        end: false,
      };
    }

    try {
      const { assessmentId, amount, providerId } = session.data;
      const payment = await this.paymentService.initiatePayment({
        userId: session.userId,
        assessmentId,
        amount,
        providerId,
        phoneNumber: session.phoneNumber,
        ipAddress: 'ussd',
      });

      // Simulate mobile money confirmation (for demo)
      try {
        await this.paymentService.confirmPayment(
          payment.id,
          payment.transaction_reference,
          'confirmed'
        );
      } catch (confirmErr) {
        logger.warn('Auto‑confirmation failed (demo)', { error: confirmErr });
      }

      const successMsg = `Payment of ${amount} SOS via ${session.data.providerName} confirmed.\nRef: ${payment.transaction_reference}\nThank you!`;
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

  // ----------------------------------------------------------------
  // STATEMENT
  // ----------------------------------------------------------------
  private async getStatementText(userId: string): Promise<string> {
    const summary = await this.taxService.getTaxpayerSummary(userId);
    const payResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_paid
       FROM payments
       WHERE user_id = $1 AND status = 'confirmed'`,
      [userId]
    );
    const totalPaid = parseFloat(payResult.rows[0].total_paid);
    return `Tax Summary:\nTotal Due: ${summary.assessments.total_due} SOS\nPending: ${summary.assessments.pending}\nPaid: ${totalPaid} SOS\nOverdue: ${summary.assessments.overdue}\n\n0. Back`;
  }

  private async handleStatement(session: USSDState, text: string) {
    if (text === '0') {
      session.state = 'MAIN';
      this.sessionStore.set(session.sessionId, session);
      const menu =
        'Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit';
      return { sessionId: session.sessionId, response: menu, end: false };
    }
    return {
      sessionId: session.sessionId,
      response: 'Invalid option. Reply 0 to go back.',
      end: false,
    };
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}