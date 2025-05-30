import { db } from './indexed-db';

interface MigrationItem {
  key: string;
  store: 'settings' | 'currencyRates' | 'moneyTracker' | 'scorecard';
}

const MIGRATION_ITEMS: MigrationItem[] = [
  { key: 'settings', store: 'settings' },
  { key: 'currencyRates', store: 'currencyRates' },
  { key: 'moneyTracker', store: 'moneyTracker' },
  { key: 'scorecard', store: 'scorecard' },
];

export async function migrateFromLocalStorage() {
  if (typeof window === 'undefined') {
    return; // Don't run migration on server
  }

  try {
    console.log('Starting migration from localStorage to IndexedDB...');
    
    for (const item of MIGRATION_ITEMS) {
      const data = localStorage.getItem(item.key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          await db.set(item.store, item.key, parsedData);
          console.log(`Successfully migrated ${item.key} to IndexedDB`);
          
          // Optionally remove from localStorage after successful migration
          // localStorage.removeItem(item.key);
        } catch (error) {
          console.error(`Error migrating ${item.key}:`, error);
        }
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Function to check if migration is needed
export async function checkAndMigrate() {
  if (typeof window === 'undefined') {
    return; // Don't run migration on server
  }

  try {
    // Check if any data exists in localStorage
    const hasLocalStorageData = MIGRATION_ITEMS.some(item => 
      localStorage.getItem(item.key) !== null
    );

    if (hasLocalStorageData) {
      console.log('Found data in localStorage, starting migration...');
      await migrateFromLocalStorage();
    } else {
      console.log('No data found in localStorage, migration not needed');
    }
  } catch (error) {
    console.error('Error checking migration status:', error);
    throw error;
  }
} 