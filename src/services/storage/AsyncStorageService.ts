import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Low-level key-value storage abstraction over AsyncStorage.
 * Decouples storage implementation from business logic, enabling
 * future migration to SQLite without changing the repository layer.
 */
export class AsyncStorageService {
  static async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  static async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  static async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  /** Clears all AsyncStorage data. Intended for use in testing only. */
  static async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}
