import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
                    <div className="bg-slate-800 p-6 rounded-xl border border-red-500 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
                        <div className="bg-slate-900 p-4 rounded overflow-auto max-h-60 mb-4">
                            <p className="font-mono text-sm text-red-400 whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>
                        <details className="text-slate-400 text-xs">
                            <summary className="cursor-pointer mb-2">Stack Trace</summary>
                            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
