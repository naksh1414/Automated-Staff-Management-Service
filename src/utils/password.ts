import bcrypt from "bcryptjs";

export class PasswordUtil {
  /**
   * Generate a salt and hash the password
   * @param password Plain text password
   * @param saltRounds Number of salt rounds (default: 10)
   * @returns Hashed password
   */
  static async hash(
    password: string,
    saltRounds: number = 10
  ): Promise<string> {
    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(saltRounds);
      // Hash password with salt
      return bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error("Error hashing password");
    }
  }

  /**
   * Compare plain text password with hashed password
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password from database
   * @returns Boolean indicating if passwords match
   */
  static async compare(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error("Error comparing passwords");
    }
  }

  /**
   * Validate password strength
   * @param password Plain text password
   * @returns Boolean indicating password strength
   */
  static validatePasswordStrength(password: string): boolean {
    // Strong password requirements:
    // - At least 8 characters long
    // - Contains at least one uppercase letter
    // - Contains at least one lowercase letter
    // - Contains at least one number
    // - Contains at least one special character
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Generate a random password
   * @param length Password length (default: 12)
   * @returns Randomly generated password
   */
  static generateRandomPassword(length: number = 12): string {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;

    let password = "";

    // Ensure at least one character from each category
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }
}
