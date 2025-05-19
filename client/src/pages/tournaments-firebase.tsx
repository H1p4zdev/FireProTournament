import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db, AuthContext } from '../App';
import { useContext } from 'react';
import { Search, Calendar, Users, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import TeamRegistrationModal from '@/components/modals/team-registration-modal';

interface Tournament {
  id: string;
  title: string;
  description: string;
  entryFee: number;
  prizePool: number;
  startTime: Timestamp;
  maxTeams: number;
  registeredTeams: number;
  tournamentType: 'solo' | 'duo' | 'squad';
  status: 'upcoming' | 'live' | 'completed';
  imageUrl?: string;
  createdAt: Timestamp;
}

export default function TournamentFirebase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const authContext = useContext(AuthContext);
  
  // For registration modal
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  
  // Fetch tournaments from Firebase
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Create a base query for all tournaments, ordered by start time
        let tournamentsQuery = query(
          collection(db, 'tournaments'),
          orderBy('startTime', 'desc')
        );
        
        const snapshot = await getDocs(tournamentsQuery);
        const tournamentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Tournament[];
        
        setTournaments(tournamentsData);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);
  
  // Format date for display
  const formatDate = (date: Timestamp | Date): string => {
    const jsDate = date instanceof Timestamp ? date.toDate() : date;
    return jsDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Apply filters to tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    // Filter by search term
    const matchesSearch = tournament.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || 
                          (categoryFilter === 'solo' && tournament.tournamentType === 'solo') ||
                          (categoryFilter === 'duo' && tournament.tournamentType === 'duo') ||
                          (categoryFilter === 'squad' && tournament.tournamentType === 'squad') ||
                          (categoryFilter === 'free' && tournament.entryFee === 0) ||
                          (categoryFilter === 'premium' && tournament.entryFee > 0);
    
    return matchesSearch && matchesCategory;
  });
  
  const upcomingTournaments = filteredTournaments.filter(t => t.status === 'upcoming');
  const liveTournaments = filteredTournaments.filter(t => t.status === 'live');
  const pastTournaments = filteredTournaments.filter(t => t.status === 'completed');
  
  const handleViewDetails = (tournamentId: string) => {
    navigate(`/tournament/${tournamentId}`);
  };
  
  const handleRegister = (tournament: Tournament) => {
    if (!authContext?.user) {
      // If user is not logged in, redirect to auth page
      navigate('/auth');
      return;
    }
    
    setSelectedTournament(tournament);
    setRegistrationModalOpen(true);
  };
  
  // Tournament Card Component
  const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
    const isFull = tournament.registeredTeams >= tournament.maxTeams;
    const isPast = tournament.status === 'completed';
    const isLive = tournament.status === 'live';
    
    return (
      <div className="bg-dark-light rounded-lg overflow-hidden hover:shadow-lg transition-all">
        <div className="relative h-32">
          <img 
            src={tournament.imageUrl || "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&h=400"} 
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Tournament Type Badge */}
          <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded">
            {tournament.tournamentType.charAt(0).toUpperCase() + tournament.tournamentType.slice(1)}
          </div>
          
          {/* Status Badge */}
          {isLive && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></span>
              LIVE
            </div>
          )}
          
          {isPast && (
            <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
              Completed
            </div>
          )}
          
          {/* Entry Fee Badge */}
          <div className="absolute bottom-2 right-2 text-xs">
            {tournament.entryFee > 0 ? (
              <span className="bg-dark-light text-accent px-2 py-1 rounded font-medium">
                Entry: {formatCurrency(tournament.entryFee)}
              </span>
            ) : (
              <span className="bg-green-500/80 text-white px-2 py-1 rounded font-medium">
                Free Entry
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-white text-lg line-clamp-1">{tournament.title}</h3>
          
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-300 text-sm">
                <Calendar className="w-4 h-4 mr-1 text-primary" />
                <span>{formatDate(tournament.startTime)}</span>
              </div>
              
              <div className="flex items-center text-gray-300 text-sm">
                <Users className="w-4 h-4 mr-1 text-primary" />
                <span>{tournament.registeredTeams}/{tournament.maxTeams}</span>
              </div>
            </div>
            
            <div className="flex items-center text-accent text-sm font-medium">
              <Award className="w-4 h-4 mr-1 text-accent" />
              <span>Prize: {formatCurrency(tournament.prizePool)}</span>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => handleViewDetails(tournament.id)}
              className="flex-1 py-2 bg-secondary text-white rounded text-sm font-medium hover:bg-secondary/80 transition"
            >
              View Details
            </button>
            
            {!isPast && !isFull && (
              <button
                onClick={() => handleRegister(tournament)}
                className="flex-1 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/80 transition"
              >
                Register
              </button>
            )}
            
            {!isPast && isFull && (
              <button
                disabled
                className="flex-1 py-2 bg-gray-600 text-gray-300 rounded text-sm font-medium cursor-not-allowed"
              >
                Full
              </button>
            )}
            
            {isPast && (
              <button
                onClick={() => handleViewDetails(tournament.id)}
                className="flex-1 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-600/80 transition"
              >
                Results
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Tournaments</h1>
      
      {/* Tournament Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar pb-2">
        <button 
          onClick={() => setCategoryFilter('all')}
          className={`${categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          All Tournaments
        </button>
        <button 
          onClick={() => setCategoryFilter('solo')}
          className={`${categoryFilter === 'solo' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          Solo
        </button>
        <button 
          onClick={() => setCategoryFilter('duo')}
          className={`${categoryFilter === 'duo' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          Duo
        </button>
        <button 
          onClick={() => setCategoryFilter('squad')}
          className={`${categoryFilter === 'squad' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          Squad
        </button>
        <button 
          onClick={() => setCategoryFilter('free')}
          className={`${categoryFilter === 'free' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          Free Entry
        </button>
        <button 
          onClick={() => setCategoryFilter('premium')}
          className={`${categoryFilter === 'premium' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300'} px-4 py-2 rounded-full text-sm whitespace-nowrap`}
        >
          Premium
        </button>
      </div>
      
      {/* Tournament Search */}
      <div className="relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tournaments..." 
          className="w-full bg-dark-light border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-primary"
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {/* Tournament Listings */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Live Tournaments */}
            {liveTournaments.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></span> 
                  Live Tournaments
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveTournaments.map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Upcoming Tournaments */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Upcoming Tournaments</h3>
              
              {upcomingTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingTournaments.map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-dark-light rounded-lg">
                  <p className="text-gray-400">No upcoming tournaments found</p>
                </div>
              )}
            </div>
            
            {/* Past Tournaments */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Past Tournaments</h3>
              
              {pastTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastTournaments.map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-dark-light rounded-lg">
                  <p className="text-gray-400">No past tournaments found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Team Registration Modal */}
      {selectedTournament && (
        <TeamRegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          tournamentId={selectedTournament.id}
          tournamentName={selectedTournament.title}
          tournamentType={selectedTournament.tournamentType}
          entryFee={selectedTournament.entryFee}
          maxTeams={selectedTournament.maxTeams}
          registeredTeams={selectedTournament.registeredTeams}
        />
      )}
    </div>
  );
}