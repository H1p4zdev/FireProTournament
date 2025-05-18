import {
  users, type User, type InsertUser,
  tournaments, type Tournament, type InsertTournament,
  teams, type Team, type InsertTeam,
  teamMembers, type TeamMember, type InsertTeamMember,
  transactions, type Transaction, type InsertTransaction
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  getUserByFreeFireUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, amount: number): Promise<User>;
  
  // Tournaments
  getTournaments(filter?: { status?: string, type?: string }): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, data: Partial<Tournament>): Promise<Tournament | undefined>;
  
  // Teams
  getTeams(tournamentId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  
  // Leaderboard
  getTopPlayers(limit: number): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tournaments: Map<number, Tournament>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private transactions: Map<number, Transaction>;
  
  private userId = 1;
  private tournamentId = 1;
  private teamId = 1;
  private teamMemberId = 1;
  private transactionId = 1;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.transactions = new Map();
    
    // Seed some initial users for demo purposes
    try {
      this.seedInitialData();
    } catch (error) {
      console.error("Failed to seed initial data:", error);
    }
  }

  private async seedInitialData() {
    try {
      // Directly insert users instead of using createUser to avoid the updateWallet race condition
      const user1: User = {
        id: this.userId++,
        username: "fireking92",
        password: "password123",
        displayName: "FireKing92",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        freeFireUid: "123456789",
        mobileNumber: "01711111111",
        walletBalance: 500,
        createdAt: new Date()
      };
      this.users.set(user1.id, user1);
      
      const user2: User = {
        id: this.userId++,
        username: "headhunterbd",
        password: "password123",
        displayName: "HeadHunterBD",
        avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
        freeFireUid: "987654321",
        mobileNumber: "01722222222",
        walletBalance: 300,
        createdAt: new Date()
      };
      this.users.set(user2.id, user2);
      
      const user3: User = {
        id: this.userId++,
        username: "queenSniper",
        password: "password123",
        displayName: "QueenSniper",
        avatar: "https://images.unsplash.com/photo-1567784177951-6fa58317e16b",
        freeFireUid: "456789123",
        mobileNumber: "01733333333",
        walletBalance: 200,
        createdAt: new Date()
      };
      this.users.set(user3.id, user3);
      
      // Add some sample tournaments - directly adding to avoid async issues
      const t1: Tournament = {
        id: this.tournamentId++,
        name: "Weekend Warrior Cup",
        description: "Join this exciting weekend tournament to compete against the best Free Fire players in Bangladesh! Top 3 teams will receive cash prizes.",
        type: "squad",
        gameMode: "battle-royale",
        map: "Bermuda",
        entryFee: 100,
        prizePool: 10000,
        maxTeams: 100,
        registeredTeams: 0,
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        visibility: "public",
        status: "upcoming",
        createdBy: user1.id,
        prizes: [
          { position: 1, amount: 5000 },
          { position: 2, amount: 3000 },
          { position: 3, amount: 2000 }
        ],
        rules: "All players must be registered with valid Free Fire ID. Teams must consist of 4 players. Map: Bermuda. Cheating will result in disqualification.",
        createdAt: new Date()
      };
      this.tournaments.set(t1.id, t1);

      const t2: Tournament = {
        id: this.tournamentId++,
        name: "Squad Battle",
        description: "Intense squad battle for the best teams in Bangladesh.",
        type: "squad",
        gameMode: "battle-royale",
        map: "Bermuda",
        entryFee: 100,
        prizePool: 8000,
        maxTeams: 100,
        registeredTeams: 0,
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Already started
        visibility: "public",
        status: "live",
        createdBy: user2.id,
        prizes: [
          { position: 1, amount: 4000 },
          { position: 2, amount: 2500 },
          { position: 3, amount: 1500 }
        ],
        rules: "Standard battle royale rules apply.",
        createdAt: new Date()
      };
      this.tournaments.set(t2.id, t2);

      const t3: Tournament = {
        id: this.tournamentId++,
        name: "Duo Clash",
        description: "Find a partner and join this exciting duo tournament.",
        type: "duo",
        gameMode: "battle-royale",
        map: "Kalahari",
        entryFee: 50,
        prizePool: 5000,
        maxTeams: 50,
        registeredTeams: 0,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Already started
        visibility: "public",
        status: "live",
        createdBy: user3.id,
        prizes: [
          { position: 1, amount: 2500 },
          { position: 2, amount: 1500 },
          { position: 3, amount: 1000 }
        ],
        rules: "Duo teams only. Map: Kalahari.",
        createdAt: new Date()
      };
      this.tournaments.set(t3.id, t3);

      const t4: Tournament = {
        id: this.tournamentId++,
        name: "Solo Showdown",
        description: "Show your individual skills in this solo tournament.",
        type: "solo",
        gameMode: "battle-royale",
        map: "Purgatory",
        entryFee: 30,
        prizePool: 3000,
        maxTeams: 100,
        registeredTeams: 0,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Already started
        visibility: "public",
        status: "live",
        createdBy: user1.id,
        prizes: [
          { position: 1, amount: 1500 },
          { position: 2, amount: 1000 },
          { position: 3, amount: 500 }
        ],
        rules: "Solo players only. Map: Purgatory.",
        createdAt: new Date()
      };
      this.tournaments.set(t4.id, t4);
      
      // Add some sample transactions - direct add without using wallet update
      const transaction1: Transaction = {
        id: this.transactionId++,
        userId: user1.id,
        amount: 500,
        type: "deposit",
        status: "completed",
        paymentMethod: "bKash",
        reference: "Initial deposit",
        createdAt: new Date()
      };
      this.transactions.set(transaction1.id, transaction1);
      
      const transaction2: Transaction = {
        id: this.transactionId++,
        userId: user2.id,
        amount: 300,
        type: "deposit",
        status: "completed",
        paymentMethod: "Nagad",
        reference: "Initial deposit",
        createdAt: new Date()
      };
      this.transactions.set(transaction2.id, transaction2);
      
      const transaction3: Transaction = {
        id: this.transactionId++,
        userId: user3.id,
        amount: 200,
        type: "deposit",
        status: "completed",
        paymentMethod: "Rocket",
        reference: "Initial deposit",
        createdAt: new Date()
      };
      this.transactions.set(transaction3.id, transaction3);
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByMobile(mobileNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.mobileNumber === mobileNumber
    );
  }

  async getUserByFreeFireUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.freeFireUid === uid
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(userId: number, amount: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      walletBalance: user.walletBalance + amount
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Tournaments
  async getTournaments(filter?: { status?: string, type?: string }): Promise<Tournament[]> {
    let tournaments = Array.from(this.tournaments.values());
    
    if (filter) {
      if (filter.status) {
        tournaments = tournaments.filter(t => t.status === filter.status);
      }
      if (filter.type) {
        tournaments = tournaments.filter(t => t.type === filter.type);
      }
    }
    
    return tournaments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async createTournament(tournamentData: InsertTournament): Promise<Tournament> {
    const id = this.tournamentId++;
    const createdAt = new Date();
    const registeredTeams = 0;
    const tournament: Tournament = { ...tournamentData, id, registeredTeams, createdAt };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: number, data: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    const updatedTournament = { ...tournament, ...data };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  // Teams
  async getTeams(tournamentId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(
      (team) => team.tournamentId === tournamentId
    );
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const id = this.teamId++;
    const createdAt = new Date();
    const team: Team = { ...teamData, id, createdAt };
    this.teams.set(id, team);
    
    // Update tournament registered teams count
    const tournament = this.tournaments.get(teamData.tournamentId);
    if (tournament) {
      const updatedTournament = {
        ...tournament,
        registeredTeams: tournament.registeredTeams + 1
      };
      this.tournaments.set(tournament.id, updatedTournament);
    }
    
    return team;
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(
      (member) => member.teamId === teamId
    );
  }

  async addTeamMember(teamMemberData: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberId++;
    const createdAt = new Date();
    const teamMember: TeamMember = { ...teamMemberData, id, createdAt };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  // Transactions
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const createdAt = new Date();
    const transaction: Transaction = { ...transactionData, id, createdAt };
    this.transactions.set(id, transaction);
    
    // Update user's wallet balance
    if (transaction.status === "completed") {
      let amount = transaction.amount;
      if (transaction.type === "withdrawal" || transaction.type === "tournament_entry") {
        amount = -amount; // Deduct for withdrawals and tournament entries
      }
      await this.updateUserWallet(transaction.userId, amount);
    }
    
    return transaction;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Leaderboard
  async getTopPlayers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.walletBalance - a.walletBalance)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
