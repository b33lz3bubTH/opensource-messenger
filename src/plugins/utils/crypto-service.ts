import * as crypto from "crypto";
import { appConfigs } from "../../config";

export class CryptoService {
  private algorithm: string;
  private secretKey: Buffer;

  constructor() {
    this.algorithm = "aes-256-cbc"; // Encryption algorithm
    this.secretKey = Buffer.from(appConfigs.passwordSecrets, "hex"); // Your secret key in hex format
  }

  // Method to encrypt a string
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    // Return the iv and encrypted text together
    return iv.toString("hex") + ":" + encrypted;
  }

  // Method to decrypt a string
  decrypt(encryptedText: string): string {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(iv, "hex"),
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
