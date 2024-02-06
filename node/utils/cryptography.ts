import { cipherIV, cipherKey } from "./constants";
const crypto = require('crypto');

export function AES256Encode(plaintext: string): string {
  let cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, cipherIV);
  let ciphertext = cipher.update(plaintext, 'utf-8', 'hex');
  return (ciphertext + cipher.final('hex'));
}

export function AES256Decode(ciphertext: string): string {
  let decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, cipherIV);
  let plaintext = decipher.update(ciphertext, 'hex', 'utf-8');
  return (plaintext + decipher.final('utf-8'));
}

export function base64Encode(data: string): string {
  return Buffer.from(data).toString('base64');
}

export function base64Decode(data: string): string {
  return Buffer.from(data, 'base64').toString('utf-8');
}

export function sha256(data: string): string {
  let hash = crypto.createHash('sha256');
  data = hash.update(data, 'utf-8').digest('hex');
  return data;
}

export function sha512(data: string): string {
  let hash = crypto.createHash('sha512');
  data = hash.update(data, 'utf-8').digest('hex');
  return data;
}

