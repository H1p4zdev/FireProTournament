import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/providers/language-provider';
import { useToast } from '@/hooks/use-toast';

export default function CreateProfile() {
  const [nickname, setNickname] = useState('');
  const [freeFireUID, setFreeFireUID] = useState('');
  const [division, setDivision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createProfile } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Get phone number from URL state or use a default
  const phoneNumber = '01712345678'; // In a real app, this would come from the auth step
  
  const handleSubmit = async () => {
    if (!nickname || !freeFireUID || !division) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await createProfile({
        phoneNumber,
        nickname,
        freeFireUID,
        division,
        avatarUrl: "https://images.unsplash.com/photo-1566753323558-f4e0952af115" // Default avatar
      });
      
      if (success) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-dark z-30 flex flex-col items-center px-6 pt-12 pb-6">
      <h2 className="text-2xl font-bold text-primary font-heading mb-6">{t('profile.createProfile')}</h2>
      
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1566753323558-f4e0952af115" 
              alt="Default Avatar" 
              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2">
              <i className="ri-camera-line"></i>
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="ri-user-line text-gray-400"></i>
            </span>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
              placeholder={t('profile.nickname')}
            />
          </div>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="ri-gamepad-line text-gray-400"></i>
            </span>
            <input 
              type="text" 
              value={freeFireUID}
              onChange={(e) => setFreeFireUID(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
              placeholder={t('profile.freeFireUID')}
            />
          </div>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="ri-map-pin-line text-gray-400"></i>
            </span>
            <select 
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary appearance-none"
            >
              <option value="" disabled>{t('profile.division')}</option>
              <option value="dhaka">{t('profile.divisonOptions.dhaka')}</option>
              <option value="chittagong">{t('profile.divisonOptions.chittagong')}</option>
              <option value="khulna">{t('profile.divisonOptions.khulna')}</option>
              <option value="rajshahi">{t('profile.divisonOptions.rajshahi')}</option>
              <option value="barisal">{t('profile.divisonOptions.barisal')}</option>
              <option value="sylhet">{t('profile.divisonOptions.sylhet')}</option>
              <option value="rangpur">{t('profile.divisonOptions.rangpur')}</option>
              <option value="mymensingh">{t('profile.divisonOptions.mymensingh')}</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="ri-arrow-down-s-line text-gray-400"></i>
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? t('common.loading') : t('profile.completeProfile')}
        </button>
      </div>
    </div>
  );
}
