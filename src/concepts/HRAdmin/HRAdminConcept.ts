import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "HRAdmin" + ".";

// --- Type Definitions ---
type HRAdminID = ID;

interface HRAdminDoc {
  _id: HRAdminID;
  email: string;
  password: string; // Hashed password
}

/**
 * HRAdmin concept for managing HR administrator authentication
 */
export default class HRAdminConcept {
  private readonly hrAdmins: Collection<HRAdminDoc>;

  constructor(private readonly db: Db) {
    this.hrAdmins = this.db.collection(PREFIX + "hrAdmins");
  }

  /**
   * Hash a password using SHA-256
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return hashHex;
  }

  /**
   * registerHRAdmin (email: String, password: String): (hrAdmin: HRAdmin)
   * **requires** email is unique and not empty, password is not empty
   * **effects** creates a new HRAdmin with the given email and hashed password
   */
  async registerHRAdmin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ hrAdmin: HRAdminID }> {
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    if (!password || password.trim() === "") {
      throw new Error("Password cannot be empty");
    }

    // Check if email already exists
    const existingAdmin = await this.hrAdmins.findOne({ email });
    if (existingAdmin) {
      throw new Error("HR Admin with email already exists");
    }

    const hrAdminId = freshID() as HRAdminID;
    const hashedPassword = await this.hashPassword(password);

    const hrAdminDoc: HRAdminDoc = {
      _id: hrAdminId,
      email,
      password: hashedPassword,
    };

    await this.hrAdmins.insertOne(hrAdminDoc);
    return { hrAdmin: hrAdminId };
  }

  /**
   * authenticateHRAdmin (email: String, password: String): (hrAdmin: HRAdmin)
   * **requires** email and password are not empty
   * **effects** verifies the credentials and returns the HRAdmin if valid
   */
  async authenticateHRAdmin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ hrAdmin: HRAdminID }> {
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    if (!password || password.trim() === "") {
      throw new Error("Password cannot be empty");
    }

    const admin = await this.hrAdmins.findOne({ email });
    if (!admin) {
      throw new Error("Invalid email or password");
    }

    const hashedPassword = await this.hashPassword(password);
    if (admin.password !== hashedPassword) {
      throw new Error("Invalid email or password");
    }

    return { hrAdmin: admin._id };
  }

  /**
   * getHRAdmin (hrAdminId: HRAdminID): (hrAdminData: HRAdminDoc)
   * **requires** hrAdminId exists
   * **effects** returns the HRAdmin data (excluding password)
   */
  async getHRAdmin({
    hrAdminId,
  }: {
    hrAdminId: HRAdminID;
  }): Promise<{ hrAdminData: { _id: HRAdminID; email: string } }> {
    const admin = await this.hrAdmins.findOne({ _id: hrAdminId });
    if (!admin) {
      throw new Error("HRAdmin not found");
    }

    // Return admin data without password
    return {
      hrAdminData: {
        _id: admin._id,
        email: admin.email,
      },
    };
  }
}
