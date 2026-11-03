import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    id: "com.saas.tenant-management",
    version: "1.0.0",
    name: "SaaS Subscription & Settings",
    about: "Manage your store's subscription, branding, and global SaaS settings.",
    permissions: [
      "MANAGE_APPS", // Required to communicate back to Super Admin API securely
      "MANAGE_SETTINGS"
    ],
    appUrl: "http://localhost:3000",
    configurationUrl: "http://localhost:3000/configuration",
    tokenTargetUrl: "http://localhost:3000/api/register",
    dataPrivacyUrl: "https://your-saas-website.com/privacy",
    homepageUrl: "https://your-saas-website.com",
    supportUrl: "https://your-saas-website.com/support"
  };

  return NextResponse.json(manifest);
}
