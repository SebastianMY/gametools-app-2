import { AsyncStorageService } from '../../src/services/storage/AsyncStorageService';

// ---------------------------------------------------------------------------
// Manual mock for @react-native-async-storage/async-storage
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Import after mocking so we get the mocked version.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MockAsyncStorage = require('@react-native-async-storage/async-storage');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetMocks(): void {
  MockAsyncStorage.setItem.mockReset();
  MockAsyncStorage.getItem.mockReset();
  MockAsyncStorage.removeItem.mockReset();
  MockAsyncStorage.clear.mockReset();
}

// ---------------------------------------------------------------------------
// AsyncStorageService.setItem / getItem
// ---------------------------------------------------------------------------

describe('AsyncStorageService', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('setItem', () => {
    it('delegates to AsyncStorage.setItem with correct key and value', async () => {
      MockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await AsyncStorageService.setItem('@games', '[]');

      expect(MockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(MockAsyncStorage.setItem).toHaveBeenCalledWith('@games', '[]');
    });

    it('propagates errors thrown by AsyncStorage', async () => {
      const storageError = new Error('Disk full');
      MockAsyncStorage.setItem.mockRejectedValueOnce(storageError);

      await expect(AsyncStorageService.setItem('@games', '[]')).rejects.toThrow('Disk full');
    });
  });

  describe('getItem', () => {
    it('returns the stored value for an existing key', async () => {
      MockAsyncStorage.getItem.mockResolvedValueOnce('["game1"]');

      const result = await AsyncStorageService.getItem('@games');

      expect(result).toBe('["game1"]');
      expect(MockAsyncStorage.getItem).toHaveBeenCalledWith('@games');
    });

    it('returns null for a key that has not been set', async () => {
      MockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await AsyncStorageService.getItem('@nonExistentKey');

      expect(result).toBeNull();
    });

    it('propagates errors thrown by AsyncStorage', async () => {
      const storageError = new Error('Read error');
      MockAsyncStorage.getItem.mockRejectedValueOnce(storageError);

      await expect(AsyncStorageService.getItem('@games')).rejects.toThrow('Read error');
    });
  });

  describe('setItem / getItem round-trip', () => {
    it('stores and retrieves a value correctly', async () => {
      const key = '@lastActiveGameId';
      const value = 'abc-123-uuid';

      // Simulate storage with a simple in-memory map.
      const store: Record<string, string> = {};
      MockAsyncStorage.setItem.mockImplementation(
        (k: string, v: string) => {
          store[k] = v;
          return Promise.resolve();
        },
      );
      MockAsyncStorage.getItem.mockImplementation((k: string) =>
        Promise.resolve(store[k] ?? null),
      );

      await AsyncStorageService.setItem(key, value);
      const retrieved = await AsyncStorageService.getItem(key);

      expect(retrieved).toBe(value);
    });
  });

  describe('removeItem', () => {
    it('delegates to AsyncStorage.removeItem with the correct key', async () => {
      MockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

      await AsyncStorageService.removeItem('@games');

      expect(MockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(MockAsyncStorage.removeItem).toHaveBeenCalledWith('@games');
    });
  });

  describe('clear', () => {
    it('delegates to AsyncStorage.clear', async () => {
      MockAsyncStorage.clear.mockResolvedValueOnce(undefined);

      await AsyncStorageService.clear();

      expect(MockAsyncStorage.clear).toHaveBeenCalledTimes(1);
    });
  });
});
