import { type User, type InsertUser, type WebhookEvent, type InsertWebhookEvent } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
  getWebhookEvents(limit?: number): Promise<WebhookEvent[]>;
  getWebhookEventsByRepository(repository: string, limit?: number): Promise<WebhookEvent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private webhookEvents: WebhookEvent[];

  constructor() {
    this.users = new Map();
    this.webhookEvents = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createWebhookEvent(insertEvent: InsertWebhookEvent): Promise<WebhookEvent> {
    const id = randomUUID();
    const event: WebhookEvent = {
      id,
      ...insertEvent,
      timestamp: new Date(),
    };
    this.webhookEvents.unshift(event);
    return event;
  }

  async getWebhookEvents(limit: number = 50): Promise<WebhookEvent[]> {
    return this.webhookEvents.slice(0, limit);
  }

  async getWebhookEventsByRepository(repository: string, limit: number = 50): Promise<WebhookEvent[]> {
    return this.webhookEvents
      .filter(event => event.repository === repository)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
