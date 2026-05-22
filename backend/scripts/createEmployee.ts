// scripts/createEmployee.ts
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../src/config/database";
import { encrypt, hashField } from "../src/utils/encryption"; // ✅ use the real hashField
import crypto from "crypto";

const EMAIL = "employee@mail.com";
const PASSWORD = "12345678";
const FULL_NAME = "Employee User";
const ROLE = "employee";

async function createEmployee() {
  const client = await pool.connect();
  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 12);

    const encryptedEmail = encrypt(EMAIL);
    const encryptedPhone = encrypt("");          // empty phone
    const encryptedNationalId = encrypt("");     // empty national id

    const id = uuidv4();

    // Use the same hashField as the backend
    const emailHash = hashField(EMAIL.toLowerCase());
    const phoneHash = hashField("");             // empty string hash
    const nationalIdHash = hashField("");

    await client.query(
      `INSERT INTO users (
        id, full_name, phone, email, national_id, role,
        password_hash, phone_hash, email_hash, national_id_hash,
        email_verified, phone_verified
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        FULL_NAME,
        encryptedPhone,
        encryptedEmail,
        encryptedNationalId,
        ROLE,
        passwordHash,
        phoneHash,
        emailHash,
        nationalIdHash,
        true,   // email verified
        false,  // phone not verified
      ]
    );

    console.log(`Employee created! ID: ${id}`);
    console.log(`Email: ${EMAIL}  Password: ${PASSWORD}`);
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    client.release();
    pool.end();
  }
}

createEmployee();