import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export default function CreateProfile() {
  const [nickname, setNickname] = useState('');
  const [freeFireUID, setFreeFireUID] = useState('');
  const [division, setDivision] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createProfile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleCreateProfile = async () => {
    if (!nickname || !freeFireUID) {
      toast({
        title: "Missing Information",
        description: "Nickname and Free Fire UID are required",
        variant: "destructive"
      });
      return;
    }
    
    // Basic validation for Free Fire UID
    if (!/^\d{9,12}$/.test(freeFireUID)) {
      toast({
        title: "Invalid Free Fire UID",
        description: "Free Fire UID must be 9-12 digits",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create profile using Firebase
      const success = await createProfile({
        nickname,
        freeFireUID,
        division: division || undefined,
        avatarUrl: avatarUrl || undefined
      });
      
      if (success) {
        toast({
          title: "Profile Created",
          description: "Welcome to Free Fire Tournaments!"
        });
        navigate('/home');
      } else {
        toast({
          title: "Profile Creation Failed",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "Profile Creation Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-dark z-40 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-dark-light rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-primary mb-6">Create Your Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Nickname (displayed to others)</label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
              placeholder="Enter your game nickname"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Free Fire UID</label>
            <input 
              type="text" 
              value={freeFireUID}
              onChange={(e) => setFreeFireUID(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
              placeholder="Enter your Free Fire user ID"
            />
            <p className="text-xs text-gray-400 mt-1">Your 9-12 digit Free Fire ID, found in your game profile</p>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Division (optional)</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="">Select your division</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Khulna">Khulna</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Barisal">Barisal</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-1">Avatar URL (optional)</label>
            <input 
              type="text" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
              placeholder="https://example.com/your-avatar.jpg"
            />
          </div>
          
          <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-300">
              Your profile information will be used for tournament participation. Make sure your Free Fire UID is correct to receive rewards!
            </p>
          </div>
          
          <button 
            onClick={handleCreateProfile}
            disabled={isSubmitting}
            className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}