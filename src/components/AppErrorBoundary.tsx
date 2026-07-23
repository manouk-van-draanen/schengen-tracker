/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  onRetry: () => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('App error boundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app hit an unexpected error. Your data is still stored locally, and you can retry to reload the app.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.props.onRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#09090b',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fafafa',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#d4d4d8',
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 20,
  },
  button: {
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#fafafa',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
  },
});