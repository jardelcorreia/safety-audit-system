import { api } from "encore.dev/api";
import { db } from "./db";

// Internal helper to get the password, creating a default if none exists.
async function getPassword(): Promise<string> {
  const result = await db.query`SELECT value FROM passwords LIMIT 1`;
  if (result.rows && result.rows.length > 0) {
    return result.rows[0].value as string;
  }

  // No password found, so create the default one.
  const defaultPassword = "admin";
  await db.query`INSERT INTO passwords (value) VALUES (${defaultPassword})`;
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

    const storedPassword = await getPassword();

    if (oldPassword !== storedPassword) {
      return { success: false, message: "The old password is not correct." };
    }

    // getPassword ensures a row exists, so we can now safely query for its ID.
    const result = await db.query`SELECT id FROM passwords LIMIT 1`;
    if (!result.rows || result.rows.length === 0) {
      // This should be an impossible state.
      return { success: false, message: "Could not find password row to update." };
    }
    const { id } = result.rows[0];

    await db.query`UPDATE passwords SET value = ${newPassword} WHERE id = ${id}`;

    return { success: true, message: "Password updated successfully." };
  }
);
