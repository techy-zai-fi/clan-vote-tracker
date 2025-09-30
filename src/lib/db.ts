import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface VoterRegistry {
  email: string;
  reg_num: string;
  name: string;
  gender: string;
  clan: string;
  batch: string;
  year: number;
}

export interface Clan {
  id: string; // 2-letter ID
  name: string;
  logo_url?: string;
  quote?: string;
  bg_image?: string;
  order: number;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  gender: string;
  clan_id: string;
  batch: string;
  year: number;
  photo_url?: string;
  manifesto?: string;
  is_active: boolean;
}

export interface Vote {
  id: string;
  voter_email: string;
  voter_regnum: string;
  clan_id: string;
  batch: string;
  candidate_id: string;
  created_at: string;
  device_hash?: string;
}

export interface ElectionSettings {
  id: number;
  start_at?: string;
  end_at?: string;
  is_live: boolean;
  allow_vote_changes: boolean;
  show_live_stats: boolean;
  allow_adhoc_voters: boolean;
  frozen: boolean;
}

export interface AuditLog {
  id: string;
  actor_label: string;
  action: string;
  payload_json: string;
  created_at: string;
}

interface ElectionDB extends DBSchema {
  voters: {
    key: string;
    value: VoterRegistry;
    indexes: { 'by-reg-num': string; 'by-clan': string };
  };
  clans: {
    key: string;
    value: Clan;
    indexes: { 'by-order': number };
  };
  candidates: {
    key: string;
    value: Candidate;
    indexes: { 'by-clan': string; 'by-batch': string };
  };
  votes: {
    key: string;
    value: Vote;
    indexes: { 'by-voter': string; 'by-clan': string; 'by-candidate': string };
  };
  settings: {
    key: number;
    value: ElectionSettings;
  };
  audit: {
    key: string;
    value: AuditLog;
    indexes: { 'by-date': string };
  };
}

let dbInstance: IDBPDatabase<ElectionDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<ElectionDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ElectionDB>('election-db', 1, {
    upgrade(db) {
      // Voters store
      if (!db.objectStoreNames.contains('voters')) {
        const voterStore = db.createObjectStore('voters', { keyPath: 'email' });
        voterStore.createIndex('by-reg-num', 'reg_num', { unique: true });
        voterStore.createIndex('by-clan', 'clan');
      }

      // Clans store
      if (!db.objectStoreNames.contains('clans')) {
        const clanStore = db.createObjectStore('clans', { keyPath: 'id' });
        clanStore.createIndex('by-order', 'order');
      }

      // Candidates store
      if (!db.objectStoreNames.contains('candidates')) {
        const candidateStore = db.createObjectStore('candidates', { keyPath: 'id' });
        candidateStore.createIndex('by-clan', 'clan_id');
        candidateStore.createIndex('by-batch', 'batch');
      }

      // Votes store
      if (!db.objectStoreNames.contains('votes')) {
        const voteStore = db.createObjectStore('votes', { keyPath: 'id' });
        voteStore.createIndex('by-voter', 'voter_email');
        voteStore.createIndex('by-clan', 'clan_id');
        voteStore.createIndex('by-candidate', 'candidate_id');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }

      // Audit log store
      if (!db.objectStoreNames.contains('audit')) {
        const auditStore = db.createObjectStore('audit', { keyPath: 'id' });
        auditStore.createIndex('by-date', 'created_at');
      }
    },
  });

  // Initialize default settings if not exists
  const settings = await dbInstance.get('settings', 1);
  if (!settings) {
    await dbInstance.put('settings', {
      id: 1,
      is_live: false,
      allow_vote_changes: false,
      show_live_stats: false,
      allow_adhoc_voters: true,
      frozen: false,
    });
  }

  // Seed clans if empty
  const clanCount = await dbInstance.count('clans');
  if (clanCount === 0) {
    await seedClans(dbInstance);
  }

  return dbInstance;
}

async function seedClans(db: IDBPDatabase<ElectionDB>) {
  const clans: Clan[] = [
    {
      id: 'BD',
      name: 'Bodhi',
      quote: 'Wisdom and Enlightenment',
      order: 1,
      logo_url: '/placeholder.svg',
    },
    {
      id: 'AS',
      name: 'Ashwa',
      quote: 'Speed and Strength',
      order: 2,
      logo_url: '/placeholder.svg',
    },
    {
      id: 'DR',
      name: 'Dronagiri',
      quote: 'Healing and Compassion',
      order: 3,
      logo_url: '/placeholder.svg',
    },
    {
      id: 'GA',
      name: 'Garuda',
      quote: 'Vision and Freedom',
      order: 4,
      logo_url: '/placeholder.svg',
    },
    {
      id: 'MA',
      name: 'Mahanadi',
      quote: 'Flow and Adaptability',
      order: 5,
      logo_url: '/placeholder.svg',
    },
    {
      id: 'VI',
      name: 'Vipasha',
      quote: 'Liberation and Purity',
      order: 6,
      logo_url: '/placeholder.svg',
    },
  ];

  const tx = db.transaction('clans', 'readwrite');
  await Promise.all(clans.map(clan => tx.store.put(clan)));
  await tx.done;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
