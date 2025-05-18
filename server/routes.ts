import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTournamentSchema, 
  insertTeamSchema,
  insertTeamMemberSchema,
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Basic health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      
      if (!mobileNumber) {
        return res.status(400).json({ message: "Mobile number is required" });
      }

      let user = await storage.getUserByMobile(mobileNumber);
      
      // For demo purposes, create user if doesn't exist (auto registration)
      if (!user) {
        // Generate a random username and UID for demo
        const randomNum = Math.floor(Math.random() * 10000);
        const username = `user${randomNum}`;
        const displayName = `User${randomNum}`;
        const freeFireUid = `${100000000 + randomNum}`;
        
        user = await storage.createUser({
          username,
          password: "password123", // In a real app, this would be hashed
          displayName,
          avatar: `https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100`,
          freeFireUid,
          mobileNumber,
          walletBalance: 0,
        });
      }

      // In a real app, this would include JWT token generation
      return res.json({ 
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          freeFireUid: user.freeFireUid,
          mobileNumber: user.mobileNumber,
          walletBalance: user.walletBalance
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/users/me", async (req, res) => {
    try {
      // This would normally check the JWT token
      // For demo, we'll return the first user
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        freeFireUid: user.freeFireUid,
        mobileNumber: user.mobileNumber,
        walletBalance: user.walletBalance
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const type = req.query.type as string | undefined;
      
      const tournaments = await storage.getTournaments({ status, type });
      res.json(tournaments);
    } catch (error) {
      console.error("Get tournaments error:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.json(tournament);
    } catch (error) {
      console.error("Get tournament error:", error);
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const tournamentData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(tournamentData);
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      console.error("Create tournament error:", error);
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  // Team routes
  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.tournamentId);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const teams = await storage.getTeams(tournamentId);
      res.json(teams);
    } catch (error) {
      console.error("Get teams error:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      
      // Verify tournament exists
      const tournament = await storage.getTournament(teamData.tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Verify user exists
      const captain = await storage.getUser(teamData.captainId);
      if (!captain) {
        return res.status(404).json({ message: "Captain user not found" });
      }
      
      // Create team
      const team = await storage.createTeam(teamData);
      
      // Add captain as first team member
      await storage.addTeamMember({
        teamId: team.id,
        userId: teamData.captainId
      });
      
      // Create transaction for tournament entry fee
      await storage.createTransaction({
        userId: teamData.captainId,
        amount: tournament.entryFee,
        type: "tournament_entry",
        status: "completed",
        reference: `Entry fee for tournament: ${tournament.name}`,
      });
      
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      console.error("Create team error:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.post("/api/teams/:teamId/members", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Verify team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add team member
      const teamMember = await storage.addTeamMember({
        teamId,
        userId
      });
      
      res.status(201).json(teamMember);
    } catch (error) {
      console.error("Add team member error:", error);
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  // Wallet & transaction routes
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Verify user exists
      const user = await storage.getUser(transactionData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance for withdrawals or tournament entries
      if ((transactionData.type === "withdrawal" || transactionData.type === "tournament_entry") 
          && user.walletBalance < transactionData.amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Return updated user with new wallet balance
      const updatedUser = await storage.getUser(transactionData.userId);
      
      res.status(201).json({ transaction, user: updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topPlayers = await storage.getTopPlayers(limit);
      
      res.json(topPlayers.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        freeFireUid: user.freeFireUid,
        walletBalance: user.walletBalance
      })));
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
