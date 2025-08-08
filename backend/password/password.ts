import { api } from "encore.dev/api";
import { db } from "./db";

// Internal helper to get the password, creating a default if none exists.
async function getPassword(): Promise<string> {
  const result = await db.query(`SELECT value FROM passwords LIMIT 1`);
  if (result.rows && result.rows.length > 0) {
    return result.rows[0].value as string;
  }

  // No password found, so create the default one.
  const defaultPassword = "admin";
  await db.exec(`INSERT INTO passwords (value) VALUES ($1)`, defaultPassword);
  return defaultPassword;
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
    const storedPassword = await getPassword();
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

    const result = await db.query(
      `SELECT id, value FROM passwords LIMIT 1`
    );
    if (!result.rows || result.rows.length === 0) {
      // This should not happen in practice because getPassword() would have been called by verify() first.
      return { success: false, message: "No password is set up." };
    }
    const { id, value: storedPassword } = result.rows[0];

    if (oldPassword !== storedPassword) {
      return { success: false, message: "The old password is not correct." };
    }

    await db.exec(
      `UPDATE passwords SET value = $1 WHERE id = $2`,
      newPassword,
      id
    );

    return { success: true, message: "Password updated successfully." };
  }
);
