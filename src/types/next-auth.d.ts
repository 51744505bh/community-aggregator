import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      adminRole?: string | null;
      adminStatus?: string | null;
      adminUserId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    adminRole?: string | null;
    adminStatus?: string | null;
    adminUserId?: string | null;
    provider?: string;
  }
}
