import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    database: prismaAdapter(prisma, { provider: "postgresql" }),

    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        github: {
            clientId: process.env.BETTER_AUTH_GITHUB_ID as string,
            clientSecret: process.env.BETTER_AUTH_GITHUB_SECRET as string
        },
        google: {
            clientId: process.env.BETTER_AUTH_GOOGLE_ID as string,
            clientSecret: process.env.BETTER_AUTH_GOOGLE_SECRET as string
        }
    },
    plugins: [nextCookies()],
    redirect: {
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
    },
    
})