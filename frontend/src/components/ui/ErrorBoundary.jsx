import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep a full error trace for debugging crashes in production reports.
    // eslint-disable-next-line no-console
    console.error("EduTrack error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleLogin = () => {
    window.location = "/login";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base) px-4">
        <div className="w-full max-w-xl">
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertTriangle size={42} className="text-(--accent-red)" />
              <p className="font-syne text-3xl font-bold text-(--text-primary)">
                Something went wrong
              </p>
              <p className="max-w-md text-sm text-(--text-muted)">
                {this.state.error?.message ||
                  "An unexpected error occurred while rendering this page."}
              </p>
              <div className="mt-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button onClick={this.handleRetry} variant="secondary">
                  Try again
                </Button>
                <Button onClick={this.handleLogin}>Go to login</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
