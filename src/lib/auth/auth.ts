import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.toLowerCase()?.trim();
        const password = credentials?.password as string;
        if (!email || !password) return null;

        // 공용 비밀번호 확인
        if (password !== process.env.ADMIN_PASSWORD) return null;

        // DB에서 승인된 이메일 확인
        const adminUser = await prisma.adminUser.findUnique({
          where: { email },
        });
        if (!adminUser || adminUser.status !== "ACTIVE") return null;

        // 로그인 시간 업데이트
        await prisma.adminUser.update({
          where: { email },
          data: { lastLoginAt: new Date(), authProvider: "credentials" },
        });

        // 감사 로그
        await prisma.adminAuditLog.create({
          data: {
            actorUserId: adminUser.id,
            action: "login_success",
          },
        });

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token }) {
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
  },
});
