/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// A compatibility layer that re-exports react-native-web and mocks missing react-native features
import * as RNWeb from 'react-native-web';

export * from 'react-native-web';

// Re-export default to match react-native-web's default export
export default RNWeb;

// Mock TurboModuleRegistry which is missing in react-native-web but imported by some react-native-svg modules on web
export const TurboModuleRegistry = {
  get: (name: string) => null,
  getEnforcing: (name: string) => null,
};
