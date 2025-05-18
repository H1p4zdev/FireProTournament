import { 
  users, type User, type InsertUser,
  tournaments, type Tournament, type InsertTournament,
  teams, type Team, type InsertTeam,
  transactions, type Transaction, type InsertTransaction,
  leaderboard, type LeaderboardEntry, type InsertLeaderboardEntry
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  
  // Tournament operations
  getTournament(id: number): Promise<Tournament | undefined>;
  getTournaments(filter?: Partial<{ status: string, tournamentType: string }>): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined>;
  incrementRegisteredTeams(id: number): Promise<Tournament | undefined>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByTournament(tournamentId: number): Promise<Team[]>;
  getTeamsByCaptain(captainId: number): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Leaderboard operations
  getLeaderboardEntry(userId: number): Promise<LeaderboardEntry | undefined>;
  getLeaderboard(type?: string): Promise<LeaderboardEntry[]>;
  createOrUpdateLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tournaments: Map<number, Tournament>;
  private teams: Map<number, Team>;
  private transactions: Map<number, Transaction>;
  private leaderboardEntries: Map<number, LeaderboardEntry>;
  
  // ID counters
  private userIdCounter: number;
  private tournamentIdCounter: number;
  private teamIdCounter: number;
  private transactionIdCounter: number;
  private leaderboardIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.teams = new Map();
    this.transactions = new Map();
    this.leaderboardEntries = new Map();
    
    this.userIdCounter = 1;
    this.tournamentIdCounter = 1;
    this.teamIdCounter = 1;
    this.transactionIdCounter = 1;
    this.leaderboardIdCounter = 1;
    
    // Add some initial data for dev purposes
    this.initializeDemoData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phoneNumber === phoneNumber);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 250, // Give new users some initial balance
      createdAt: now,
      lastLogin: now 
    };
    this.users.set(id, user);
    
    // Create initial leaderboard entry
    await this.createOrUpdateLeaderboardEntry({
      userId: id,
      points: 0,
      wins: 0,
      totalTournaments: 0,
      weeklyPoints: 0,
      monthlyPoints: 0
    });
    
    return user;
  }
  
  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      balance: user.balance + amount 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Tournament operations
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }
  
  async getTournaments(filter?: Partial<{ status: string, tournamentType: string }>): Promise<Tournament[]> {
    let tournaments = Array.from(this.tournaments.values());
    
    if (filter) {
      if (filter.status) {
        tournaments = tournaments.filter(t => t.status === filter.status);
      }
      if (filter.tournamentType) {
        tournaments = tournaments.filter(t => t.tournamentType === filter.tournamentType);
      }
    }
    
    // Sort by start time (most recent first)
    return tournaments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }
  
  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.tournamentIdCounter++;
    const tournament: Tournament = {
      ...insertTournament,
      id,
      registeredTeams: 0,
      createdAt: new Date()
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }
  
  async updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined> {
    const tournament = await this.getTournament(id);
    if (!tournament) return undefined;
    
    const updatedTournament = {
      ...tournament,
      status
    };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }
  
  async incrementRegisteredTeams(id: number): Promise<Tournament | undefined> {
    const tournament = await this.getTournament(id);
    if (!tournament) return undefined;
    
    const updatedTournament = {
      ...tournament,
      registeredTeams: tournament.registeredTeams + 1
    };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }
  
  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async getTeamsByTournament(tournamentId: number): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(team => team.tournamentId === tournamentId);
  }
  
  async getTeamsByCaptain(captainId: number): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(team => team.captainId === captainId);
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamIdCounter++;
    const team: Team = {
      ...insertTeam,
      id,
      createdAt: new Date()
    };
    this.teams.set(id, team);
    
    // Increment registered teams in tournament
    await this.incrementRegisteredTeams(insertTeam.tournamentId);
    
    return team;
  }
  
  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      // Sort by most recent first
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    
    // Update user balance for completed transactions
    if (transaction.status === 'completed') {
      await this.updateUserBalance(transaction.userId, transaction.amount);
    }
    
    return transaction;
  }
  
  // Leaderboard operations
  async getLeaderboardEntry(userId: number): Promise<LeaderboardEntry | undefined> {
    return Array.from(this.leaderboardEntries.values())
      .find(entry => entry.userId === userId);
  }
  
  async getLeaderboard(type: string = 'overall'): Promise<LeaderboardEntry[]> {
    let entries = Array.from(this.leaderboardEntries.values());
    
    // Sort based on the type
    if (type === 'weekly') {
      entries.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    } else if (type === 'monthly') {
      entries.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
    } else {
      entries.sort((a, b) => b.points - a.points);
    }
    
    return entries;
  }
  
  async createOrUpdateLeaderboardEntry(insertEntry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    // Check if entry already exists
    const existingEntry = await this.getLeaderboardEntry(insertEntry.userId);
    
    if (existingEntry) {
      // Update existing entry
      const updatedEntry: LeaderboardEntry = {
        ...existingEntry,
        points: (existingEntry.points || 0) + (insertEntry.points || 0),
        wins: (existingEntry.wins || 0) + (insertEntry.wins || 0),
        totalTournaments: (existingEntry.totalTournaments || 0) + (insertEntry.totalTournaments || 0),
        weeklyPoints: (existingEntry.weeklyPoints || 0) + (insertEntry.weeklyPoints || 0),
        monthlyPoints: (existingEntry.monthlyPoints || 0) + (insertEntry.monthlyPoints || 0),
        updatedAt: new Date()
      };
      this.leaderboardEntries.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    } else {
      // Create new entry
      const id = this.leaderboardIdCounter++;
      const entry: LeaderboardEntry = {
        ...insertEntry,
        id,
        points: insertEntry.points || 0,
        wins: insertEntry.wins || 0,
        totalTournaments: insertEntry.totalTournaments || 0,
        weeklyPoints: insertEntry.weeklyPoints || 0,
        monthlyPoints: insertEntry.monthlyPoints || 0,
        updatedAt: new Date()
      };
      this.leaderboardEntries.set(id, entry);
      return entry;
    }
  }
  
  // Helper method to initialize demo data
  private async initializeDemoData() {
    // Create demo user
    const user = await this.createUser({
      phoneNumber: "01712345678",
      nickname: "PlayerGhost",
      freeFireUID: "123456789",
      division: "dhaka",
      avatarUrl: "https://images.unsplash.com/photo-1566753323558-f4e0952af115",
    });
    
    // Create demo tournaments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tournamentTypes = ['solo', 'duo', 'squad'];
    
    for (let i = 0; i < 6; i++) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + i);
      
      const tournament = await this.createTournament({
        title: ['Weekly Pro Scrims', 'Solo Sniper Challenge', 'Battle Royale Championship', 'Newbie Solo Challenge', 'Dynamic Duo Cup', 'Victory Royale Cup'][i],
        description: `This is tournament #${i+1}`,
        entryFee: [100, 50, 200, 0, 100, 100][i],
        prizePool: [5000, 2000, 15000, 500, 3000, 10000][i],
        startTime: startDate,
        maxTeams: [100, 50, 100, 50, 50, 100][i],
        tournamentType: tournamentTypes[i % 3],
        status: i < 2 ? 'upcoming' : (i === 2 ? 'live' : 'upcoming'),
        createdBy: user.id,
        imageUrl: [
          "https://images.unsplash.com/photo-1593305841991-05c297ba4575",
          "https://images.unsplash.com/photo-1560253023-3ec5d502959f",
          "https://images.unsplash.com/photo-1519326844852-704caea5679e",
          "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
          "https://images.unsplash.com/photo-1511512578047-dfb367046420",
          "https://images.unsplash.com/photo-1542751110-97427bbecf20"
        ][i]
      });
      
      // Add some random registrations
      const registrations = Math.floor(Math.random() * tournament.maxTeams * 0.5);
      for (let j = 0; j < registrations; j++) {
        this.tournaments.set(tournament.id, {
          ...tournament,
          registeredTeams: j + 1
        });
      }
    }
    
    // Create demo transactions
    await this.createTransaction({
      userId: user.id,
      amount: 200,
      type: 'tournament_winning',
      description: 'Tournament Winnings',
      status: 'completed',
      paymentMethod: null
    });
    
    await this.createTransaction({
      userId: user.id,
      amount: 100,
      type: 'deposit',
      description: 'Deposit via bKash',
      status: 'completed',
      paymentMethod: 'bKash'
    });
    
    await this.createTransaction({
      userId: user.id,
      amount: -50,
      type: 'tournament_entry',
      description: 'Tournament Entry',
      status: 'completed',
      paymentMethod: null
    });
    
    // Create demo leaderboard entries
    for (let i = 0; i < 5; i++) {
      const demoUser = await this.createUser({
        phoneNumber: `017123456${i+1}`,
        nickname: ['KillerPro99', 'SnipeKing', 'HeadHunter', 'Destroyer', 'NinjaWarrior'][i],
        freeFireUID: `${1000000 + i}`,
        division: "dhaka",
        avatarUrl: [
          "https://images.unsplash.com/photo-1566753323558-f4e0952af115",
          "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36"
        ][i]
      });
      
      await this.createOrUpdateLeaderboardEntry({
        userId: demoUser.id,
        points: [8750, 7520, 6890, 5970, 5480][i],
        wins: Math.floor(Math.random() * 10),
        totalTournaments: Math.floor(Math.random() * 20) + 10,
        weeklyPoints: Math.floor(Math.random() * 1000),
        monthlyPoints: Math.floor(Math.random() * 3000),
      });
    }
    
    // Update the demo user's leaderboard entry
    await this.createOrUpdateLeaderboardEntry({
      userId: user.id,
      points: 1250,
      wins: 3,
      totalTournaments: 12,
      weeklyPoints: 250,
      monthlyPoints: 750,
    });
  }
}

export const storage = new MemStorage();
