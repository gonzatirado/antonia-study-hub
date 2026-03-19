"use client";

import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Card className="bg-card/50 border-destructive/20 m-6">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Algo salio mal</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Ocurrio un error inesperado. Intenta recargar la pagina.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recargar
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
