import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertTournamentSchema,
  insertTeamSchema,
  insertTransactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // User routes
  app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      if (!phoneNumber || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }
      
      // In a real app, we would verify the OTP here
      // For this implementation, we'll accept any OTP and check if the user exists
      
      // Check if user exists
      const existingUser = await storage.getUserByPhoneNumber(phoneNumber);
      
      if (existingUser) {
        return res.status(200).json({ 
          id: existingUser.id,
          phoneNumber: existingUser.phoneNumber,
          nickname: existingUser.nickname,
          isNewUser: false
        });
      } else {
        // New user
        return res.status(200).json({ 
          phoneNumber, 
          isNewUser: true
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ message: "Failed to verify OTP" });
    }
  });
  
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with this phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(userData.phoneNumber);
      if (existingUser) {
        return res.status(409).json({ message: "User with this phone number already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Tournament routes
  app.get('/api/tournaments', async (req: Request, res: Response) => {
    try {
      const { status, type } = req.query;
      const filter: { status?: string, tournamentType?: string } = {};
      
      if (status && typeof status === 'string') {
        filter.status = status;
      }
      
      if (type && typeof type === 'string') {
        filter.tournamentType = type;
      }
      
      const tournaments = await storage.getTournaments(filter);
      return res.status(200).json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      return res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });
  
  app.get('/api/tournaments/:id', async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      return res.status(200).json(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      return res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });
  
  app.post('/api/tournaments', async (req: Request, res: Response) => {
    try {
      const tournamentData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(tournamentData);
      return res.status(201).json(tournament);
    } catch (error) {
      console.error("Error creating tournament:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create tournament" });
    }
  });
  
  // Team routes
  app.get('/api/tournaments/:id/teams', async (req: Request, res: Response) => {
    try {
      const tournamentId = parseInt(req.params.id);
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const teams = await storage.getTeamsByTournament(tournamentId);
      return res.status(200).json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      return res.status(500).json({ message: "Failed to fetch teams" });
    }
  });
  
  app.post('/api/teams', async (req: Request, res: Response) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      
      // Verify tournament exists
      const tournament = await storage.getTournament(teamData.tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Check if tournament is full
      if (tournament.registeredTeams >= tournament.maxTeams) {
        return res.status(400).json({ message: "Tournament is full" });
      }
      
      // Check if captain exists
      const captain = await storage.getUser(teamData.captainId);
      if (!captain) {
        return res.status(404).json({ message: "Captain user not found" });
      }
      
      // Deduct entry fee if applicable
      if (tournament.entryFee > 0) {
        // Check if user has enough balance
        if (captain.balance < tournament.entryFee) {
          return res.status(400).json({ message: "Insufficient balance" });
        }
        
        // Create transaction for entry fee
        await storage.createTransaction({
          userId: captain.id,
          amount: -tournament.entryFee,
          type: 'tournament_entry',
          description: `Entry fee for ${tournament.title}`,
          status: 'completed',
          paymentMethod: null
        });
      }
      
      const team = await storage.createTeam(teamData);
      return res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create team" });
    }
  });
  
  // Transaction routes
  app.get('/api/users/:id/transactions', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const transactions = await storage.getTransactionsByUser(userId);
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  app.post('/api/transactions', async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Verify user exists
      const user = await storage.getUser(transactionData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Additional validation for withdrawals
      if (transactionData.type === 'withdrawal' && transactionData.amount < 0) {
        if (user.balance < Math.abs(transactionData.amount)) {
          return res.status(400).json({ message: "Insufficient balance" });
        }
      }
      
      const transaction = await storage.createTransaction(transactionData);
      return res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create transaction" });
    }
  });
  
  // Leaderboard routes
  app.get('/api/leaderboard', async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const leaderboardType = typeof type === 'string' ? type : 'overall';
      
      const leaderboard = await storage.getLeaderboard(leaderboardType);
      
      // Fetch user details for each leaderboard entry
      const leaderboardWithUsers = await Promise.all(
        leaderboard.map(async (entry) => {
          const user = await storage.getUser(entry.userId);
          return {
            ...entry,
            user: user ? {
              id: user.id,
              nickname: user.nickname,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      return res.status(200).json(leaderboardWithUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  app.get('/api/users/:id/leaderboard', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const entry = await storage.getLeaderboardEntry(userId);
      if (!entry) {
        return res.status(404).json({ message: "Leaderboard entry not found" });
      }
      
      return res.status(200).json(entry);
    } catch (error) {
      console.error("Error fetching leaderboard entry:", error);
      return res.status(500).json({ message: "Failed to fetch leaderboard entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
