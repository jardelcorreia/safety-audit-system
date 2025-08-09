import { api } from "encore.dev/api";
import { db } from "./db";

interface PasswordRow {
  id: number;
  value: string;
}

// Internal helper to get the password row, creating a default if none exists.
// Uses "INSERT ... RETURNING" to be atomic and avoid transaction visibility issues.
async function getPasswordRow(): Promise<PasswordRow> {
  // First, try to select the existing row.
  const result = await db.query`SELECT id, value FROM passwords LIMIT 1`;
  if (result.rows && result.rows.length > 0) {
    return result.rows[0] as PasswordRow;
  }

  // No password found, so create the default one and return it in one step.
  const defaultPassword = "admin";
  const newRow = await db.queryRow<PasswordRow>`
    INSERT INTO passwords (value)
    VALUES (${defaultPassword})
    RETURNING id, value
  `;

  if (!newRow) {
      // This should be impossible if the INSERT succeeded.
      throw new Error("Failed to create or retrieve default password.");
  }
  return newRow;
}

// Params for the verify endpoint
interface VerifyParams {
  password?: string;
}

// Response for the verify endpoint
interface VerifyResponse {
  valid: boolean;
}

/**
 * Verifies if the provided password is correct.
 * @public
 */
export const verify = api<VerifyParams, VerifyResponse>(
  {
    expose: true,
    method: "POST",
    path: "/password/verify",
  },
  async ({ password }) => {
    if (!password) {
      return { valid: false };
    }
    const { value: storedPassword } = await getPasswordRow();
    return { valid: password === storedPassword };
  }
);

// Params for the update endpoint
interface UpdateParams {
  oldPassword?: string;
  newPassword?: string;
}

// Response for the update endpoint
interface UpdateResponse {
  success: boolean;
  message: string;
}

/**
* Updates the password.
* @public
*/
export const update = api<UpdateParams, UpdateResponse>(
  {
    expose: true,
    method: "POST",
    path: "/password/update",
  },
  async ({ oldPassword, newPassword }) => {
    if (!oldPassword || !newPassword) {
      return {
        success: false,
        message: "Both old and new passwords are required.",
      };
    }

    if (newPassword.length < 4) {
      return {
        success: false,
        message: "New password must be at least 4 characters long.",
      };
    }

    const { id, value: storedPassword } = await getPasswordRow();

    if (oldPassword !== storedPassword) {
      return { success: false, message: "The old password is not correct." };
    }

    await db.exec`UPDATE passwords SET value = ${newPassword} WHERE id = ${id}`;

    return { success: true, message: "Password updated successfully." };
  }
);
