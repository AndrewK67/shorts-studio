/**
 * LocalStorage Database Implementation
 * Simple database client using browser localStorage
 * For development and prototyping - not for production
 */

import type { DatabaseClient } from './client';
import { generateId, getTimestamp } from './client';
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

const STORAGE_KEYS = {
  users: 'shorts-studio-users',
  profiles: 'shorts-studio-profiles',
  projects: 'shorts-studio-projects',
  topics: 'shorts-studio-topics',
  scripts: 'shorts-studio-scripts',
  batchPlans: 'shorts-studio-batch-plans',
  analytics: 'shorts-studio-analytics',
  videos: 'shorts-studio-videos',
};

class LocalStorageDB implements DatabaseClient {
  private getItems<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setItems<T>(key: string, items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(items));
  }

  users = {
    findById: async (id: string): Promise<User | null> => {
      const users = this.getItems<User>(STORAGE_KEYS.users);
      return users.find(u => u.id === id) || null;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      const users = this.getItems<User>(STORAGE_KEYS.users);
      return users.find(u => u.email === email) || null;
    },

    create: async (data): Promise<User> => {
      const user: User = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const users = this.getItems<User>(STORAGE_KEYS.users);
      users.push(user);
      this.setItems(STORAGE_KEYS.users, users);
      return user;
    },

    update: async (id: string, data): Promise<User> => {
      const users = this.getItems<User>(STORAGE_KEYS.users);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');

      users[index] = {
        ...users[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.users, users);
      return users[index];
    },

    delete: async (id: string): Promise<void> => {
      const users = this.getItems<User>(STORAGE_KEYS.users);
      this.setItems(STORAGE_KEYS.users, users.filter(u => u.id !== id));
    },
  };

  profiles = {
    findById: async (id: string): Promise<Profile | null> => {
      const profiles = this.getItems<Profile>(STORAGE_KEYS.profiles);
      return profiles.find(p => p.id === id) || null;
    },

    findByUserId: async (userId: string): Promise<Profile[]> => {
      const profiles = this.getItems<Profile>(STORAGE_KEYS.profiles);
      return profiles.filter(p => p.user_id === userId);
    },

    create: async (data): Promise<Profile> => {
      const profile: Profile = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const profiles = this.getItems<Profile>(STORAGE_KEYS.profiles);
      profiles.push(profile);
      this.setItems(STORAGE_KEYS.profiles, profiles);
      return profile;
    },

    update: async (id: string, data): Promise<Profile> => {
      const profiles = this.getItems<Profile>(STORAGE_KEYS.profiles);
      const index = profiles.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Profile not found');

      profiles[index] = {
        ...profiles[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.profiles, profiles);
      return profiles[index];
    },

    delete: async (id: string): Promise<void> => {
      const profiles = this.getItems<Profile>(STORAGE_KEYS.profiles);
      this.setItems(STORAGE_KEYS.profiles, profiles.filter(p => p.id !== id));
    },
  };

  projects = {
    findById: async (id: string): Promise<Project | null> => {
      const projects = this.getItems<Project>(STORAGE_KEYS.projects);
      return projects.find(p => p.id === id) || null;
    },

    findByUserId: async (userId: string): Promise<Project[]> => {
      const projects = this.getItems<Project>(STORAGE_KEYS.projects);
      return projects.filter(p => p.user_id === userId);
    },

    findByProfileId: async (profileId: string): Promise<Project[]> => {
      const projects = this.getItems<Project>(STORAGE_KEYS.projects);
      return projects.filter(p => p.profile_id === profileId);
    },

    create: async (data): Promise<Project> => {
      const project: Project = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const projects = this.getItems<Project>(STORAGE_KEYS.projects);
      projects.push(project);
      this.setItems(STORAGE_KEYS.projects, projects);
      return project;
    },

    update: async (id: string, data): Promise<Project> => {
      const projects = this.getItems<Project>(STORAGE_KEYS.projects);
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Project not found');

      projects[index] = {
        ...projects[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.projects, projects);
      return projects[index];
    },

    delete: async (id: string): Promise<void> => {
      const projects = this.getItems<Project>(STORAGE_KEYS.projects);
      this.setItems(STORAGE_KEYS.projects, projects.filter(p => p.id !== id));
    },
  };

  topics = {
    findById: async (id: string): Promise<Topic | null> => {
      const topics = this.getItems<Topic>(STORAGE_KEYS.topics);
      return topics.find(t => t.id === id) || null;
    },

    findByProjectId: async (projectId: string): Promise<Topic[]> => {
      const topics = this.getItems<Topic>(STORAGE_KEYS.topics);
      return topics.filter(t => t.project_id === projectId);
    },

    create: async (data): Promise<Topic> => {
      const topic: Topic = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const topics = this.getItems<Topic>(STORAGE_KEYS.topics);
      topics.push(topic);
      this.setItems(STORAGE_KEYS.topics, topics);
      return topic;
    },

    createMany: async (dataArray): Promise<Topic[]> => {
      const topics = this.getItems<Topic>(STORAGE_KEYS.topics);
      const newTopics = dataArray.map(data => ({
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      }));
      topics.push(...newTopics);
      this.setItems(STORAGE_KEYS.topics, topics);
      return newTopics;
    },

    update: async (id: string, data): Promise<Topic> => {
      const topics = this.getItems<Topic>(STORAGE_KEYS.topics);
      const index = topics.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Topic not found');

      topics[index] = {
        ...topics[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.topics, topics);
      return topics[index];
    },

    delete: async (id: string): Promise<void> => {
      const topics = this.getItems<Topic>(STORAGE_KEYS.topics);
      this.setItems(STORAGE_KEYS.topics, topics.filter(t => t.id !== id));
    },
  };

  scripts = {
    findById: async (id: string): Promise<Script | null> => {
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      return scripts.find(s => s.id === id) || null;
    },

    findByProjectId: async (projectId: string): Promise<Script[]> => {
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      return scripts.filter(s => s.project_id === projectId);
    },

    findByTopicId: async (topicId: string): Promise<Script[]> => {
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      return scripts.filter(s => s.topic_id === topicId);
    },

    create: async (data): Promise<Script> => {
      const script: Script = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      scripts.push(script);
      this.setItems(STORAGE_KEYS.scripts, scripts);
      return script;
    },

    createMany: async (dataArray): Promise<Script[]> => {
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      const newScripts = dataArray.map(data => ({
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      }));
      scripts.push(...newScripts);
      this.setItems(STORAGE_KEYS.scripts, scripts);
      return newScripts;
    },

    update: async (id: string, data): Promise<Script> => {
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      const index = scripts.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Script not found');

      scripts[index] = {
        ...scripts[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.scripts, scripts);
      return scripts[index];
    },

    delete: async (id: string): Promise<void> => {
      const scripts = this.getItems<Script>(STORAGE_KEYS.scripts);
      this.setItems(STORAGE_KEYS.scripts, scripts.filter(s => s.id !== id));
    },
  };

  batchPlans = {
    findById: async (id: string): Promise<BatchPlan | null> => {
      const plans = this.getItems<BatchPlan>(STORAGE_KEYS.batchPlans);
      return plans.find(p => p.id === id) || null;
    },

    findByProjectId: async (projectId: string): Promise<BatchPlan[]> => {
      const plans = this.getItems<BatchPlan>(STORAGE_KEYS.batchPlans);
      return plans.filter(p => p.project_id === projectId);
    },

    create: async (data): Promise<BatchPlan> => {
      const plan: BatchPlan = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const plans = this.getItems<BatchPlan>(STORAGE_KEYS.batchPlans);
      plans.push(plan);
      this.setItems(STORAGE_KEYS.batchPlans, plans);
      return plan;
    },

    update: async (id: string, data): Promise<BatchPlan> => {
      const plans = this.getItems<BatchPlan>(STORAGE_KEYS.batchPlans);
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Batch plan not found');

      plans[index] = {
        ...plans[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.batchPlans, plans);
      return plans[index];
    },

    delete: async (id: string): Promise<void> => {
      const plans = this.getItems<BatchPlan>(STORAGE_KEYS.batchPlans);
      this.setItems(STORAGE_KEYS.batchPlans, plans.filter(p => p.id !== id));
    },
  };

  analytics = {
    findById: async (id: string): Promise<Analytics | null> => {
      const analytics = this.getItems<Analytics>(STORAGE_KEYS.analytics);
      return analytics.find(a => a.id === id) || null;
    },

    findByUserId: async (userId: string): Promise<Analytics[]> => {
      const analytics = this.getItems<Analytics>(STORAGE_KEYS.analytics);
      return analytics.filter(a => a.user_id === userId);
    },

    findByProjectId: async (projectId: string): Promise<Analytics[]> => {
      const analytics = this.getItems<Analytics>(STORAGE_KEYS.analytics);
      return analytics.filter(a => a.project_id === projectId);
    },

    findByScriptId: async (scriptId: string): Promise<Analytics[]> => {
      const analytics = this.getItems<Analytics>(STORAGE_KEYS.analytics);
      return analytics.filter(a => a.script_id === scriptId);
    },

    create: async (data): Promise<Analytics> => {
      const analytic: Analytics = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const analytics = this.getItems<Analytics>(STORAGE_KEYS.analytics);
      analytics.push(analytic);
      this.setItems(STORAGE_KEYS.analytics, analytics);
      return analytic;
    },

    update: async (id: string, data): Promise<Analytics> => {
      const analytics = this.getItems<Analytics>(STORAGE_KEYS.analytics);
      const index = analytics.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Analytics not found');

      analytics[index] = {
        ...analytics[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.analytics, analytics);
      return analytics[index];
    },
  };

  videos = {
    findById: async (id: string): Promise<Video | null> => {
      const videos = this.getItems<Video>(STORAGE_KEYS.videos);
      return videos.find(v => v.id === id) || null;
    },

    findByProjectId: async (projectId: string): Promise<Video[]> => {
      const videos = this.getItems<Video>(STORAGE_KEYS.videos);
      return videos.filter(v => v.project_id === projectId);
    },

    findByScriptId: async (scriptId: string): Promise<Video | null> => {
      const videos = this.getItems<Video>(STORAGE_KEYS.videos);
      return videos.find(v => v.script_id === scriptId) || null;
    },

    create: async (data): Promise<Video> => {
      const video: Video = {
        ...data,
        id: generateId(),
        created_at: getTimestamp(),
        updated_at: getTimestamp(),
      };
      const videos = this.getItems<Video>(STORAGE_KEYS.videos);
      videos.push(video);
      this.setItems(STORAGE_KEYS.videos, videos);
      return video;
    },

    update: async (id: string, data): Promise<Video> => {
      const videos = this.getItems<Video>(STORAGE_KEYS.videos);
      const index = videos.findIndex(v => v.id === id);
      if (index === -1) throw new Error('Video not found');

      videos[index] = {
        ...videos[index],
        ...data,
        updated_at: getTimestamp(),
      };
      this.setItems(STORAGE_KEYS.videos, videos);
      return videos[index];
    },

    delete: async (id: string): Promise<void> => {
      const videos = this.getItems<Video>(STORAGE_KEYS.videos);
      this.setItems(STORAGE_KEYS.videos, videos.filter(v => v.id !== id));
    },
  };
}

// Export singleton instance
export const db = new LocalStorageDB();
