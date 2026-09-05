import { db } from "./db";

export function getOwnVendorProfile(userId: string) {
  return db.vendorProfile.findUnique({ where: { userId } });
}
