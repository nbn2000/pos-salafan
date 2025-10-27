import { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    toast.error(`Kutilmagan hatolik yuz berdi.: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Kutilmagan hatolik yuz berdi.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
