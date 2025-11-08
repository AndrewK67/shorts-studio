/**
 * Database Client
 * Abstraction layer for database operations
 * Can be swapped between localStorage, Supabase, PostgreSQL, etc.
 */

import type {
  User,
  Profile,
  Project,
  Topic,
  Script,
  BatchPlan,
  Analytics,
  Video,
} from './schema';

export interface DatabaseClient {
  // User operations
  users: {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
  };

  // Profile operations
  profiles: {
    findById(id: string): Promise<Profile | null>;
    findByUserId(userId: string): Promise<Profile[]>;
    create(data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile>;
    update(id: string, data: Partial<Profile>): Promise<Profile>;
    delete(id: string): Promise<void>;
  };

  // Project operations
  projects: {
    findById(id: string): Promise<Project | null>;
    findByUserId(userId: string): Promise<Project[]>;
    findByProfileId(profileId: string): Promise<Project[]>;
    create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>;
    update(id: string, data: Partial<Project>): Promise<Project>;
    delete(id: string): Promise<void>;
  };

  // Topic operations
  topics: {
    findById(id: string): Promise<Topic | null>;
    findByProjectId(projectId: string): Promise<Topic[]>;
    create(data: Omit<Topic, 'id' | 'created_at' | 'updated_at'>): Promise<Topic>;
    createMany(data: Omit<Topic, 'id' | 'created_at' | 'updated_at'>[]): Promise<Topic[]>;
    update(id: string, data: Partial<Topic>): Promise<Topic>;
    delete(id: string): Promise<void>;
  };

  // Script operations
  scripts: {
    findById(id: string): Promise<Script | null>;
    findByProjectId(projectId: string): Promise<Script[]>;
    findByTopicId(topicId: string): Promise<Script[]>;
    create(data: Omit<Script, 'id' | 'created_at' | 'updated_at'>): Promise<Script>;
    createMany(data: Omit<Script, 'id' | 'created_at' | 'updated_at'>[]): Promise<Script[]>;
    update(id: string, data: Partial<Script>): Promise<Script>;
    delete(id: string): Promise<void>;
  };

  // Batch plan operations
  batchPlans: {
    findById(id: string): Promise<BatchPlan | null>;
    findByProjectId(projectId: string): Promise<BatchPlan[]>;
    create(data: Omit<BatchPlan, 'id' | 'created_at' | 'updated_at'>): Promise<BatchPlan>;
    update(id: string, data: Partial<BatchPlan>): Promise<BatchPlan>;
    delete(id: string): Promise<void>;
  };

  // Analytics operations
  analytics: {
    findById(id: string): Promise<Analytics | null>;
    findByUserId(userId: string): Promise<Analytics[]>;
    findByProjectId(projectId: string): Promise<Analytics[]>;
    findByScriptId(scriptId: string): Promise<Analytics[]>;
    create(data: Omit<Analytics, 'id' | 'created_at' | 'updated_at'>): Promise<Analytics>;
    update(id: string, data: Partial<Analytics>): Promise<Analytics>;
  };

  // Video operations
  videos: {
    findById(id: string): Promise<Video | null>;
    findByProjectId(projectId: string): Promise<Video[]>;
    findByScriptId(scriptId: string): Promise<Video | null>;
    create(data: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video>;
    update(id: string, data: Partial<Video>): Promise<Video>;
    delete(id: string): Promise<void>;
  };
}

// Helper to generate UUIDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper for timestamps
export function getTimestamp(): Date {
  return new Date();
}
