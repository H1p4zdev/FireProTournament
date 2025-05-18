import { pgTable, text, serial, integer, boolean, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  freeFireUid: text("free_fire_uid").notNull().unique(),
  mobileNumber: text("mobile_number").notNull().unique(),
  walletBalance: integer("wallet_balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Tournament schema
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // solo, duo, squad
  gameMode: text("game_mode").notNull(), // battle-royale, clash-squad
  map: text("map").notNull(),
  entryFee: integer("entry_fee").notNull(),
  prizePool: integer("prize_pool").notNull(),
  maxTeams: integer("max_teams").notNull(),
  registeredTeams: integer("registered_teams").notNull().default(0),
  startTime: timestamp("start_time").notNull(),
  visibility: text("visibility").notNull(), // public, private
  status: text("status").notNull(), // upcoming, live, completed
  createdBy: integer("created_by").notNull().references(() => users.id),
  prizes: jsonb("prizes").notNull(), // [{position: 1, amount: 5000}, {position: 2, amount: 3000}, ...]
  rules: text("rules"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  registeredTeams: true,
  createdAt: true,
});

// Team schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  captainId: integer("captain_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

// Team Members schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.teamId, table.userId),
  };
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, tournament_entry, prize_money
  status: text("status").notNull(), // pending, completed, failed
  paymentMethod: text("payment_method"), // bKash, Nagad, Rocket, SureCash
  reference: text("reference"), // For reference to tournaments or other entities
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
