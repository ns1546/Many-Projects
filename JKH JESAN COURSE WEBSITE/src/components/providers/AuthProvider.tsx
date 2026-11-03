"use client";

import "@/lib/polyfill";
import React, { Component, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AuthErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[AuthProvider] Session error captured safely:", error?.message || error);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>;
    }
    return this.props.children;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      <SessionProvider basePath="/api/auth" refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </AuthErrorBoundary>
  );
}
