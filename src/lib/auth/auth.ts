import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // JWT 전략: DB 세션 테이블 불필요
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      // admin_users 테이블에서 role/status 조회
      if (token.email) {
        const adminUser = await prisma.adminUser.findUnique({
          where: { email: token.email.toLowerCase() },
        });
        token.adminRole = adminUser?.role ?? null;
        token.adminStatus = adminUser?.status ?? null;
        token.adminUserId = adminUser?.id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.adminRole = token.adminRole as string | null;
        session.user.adminStatus = token.adminStatus as string | null;
        session.user.adminUserId = token.adminUserId as string | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // OAuth 로그인 자체는 허용. /admin 접근 시 승인 여부 판단.
      if (user.email && account) {
        const email = user.email.toLowerCase();
        const adminUser = await prisma.adminUser.findUnique({
          where: { email },
        });
        if (adminUser) {
          // 마지막 로그인 시간 업데이트
          await prisma.adminUser.update({
            where: { email },
            data: {
              lastLoginAt: new Date(),
              authProvider: account.provider,
              name: user.name || adminUser.name,
            },
          });
          // 감사 로그
          await prisma.adminAuditLog.create({
            data: {
              actorUserId: adminUser.id,
              action: adminUser.status === "ACTIVE" ? "login_success" : "login_denied_inactive",
            },
          });
        } else {
          // 미등록 사용자 로그인 시도 기록
          await prisma.adminAuditLog.create({
            data: {
              action: "login_denied_not_allowlisted",
              metadata: { email },
            },
          });
        }
      }
      return true;
    },
  },
});
