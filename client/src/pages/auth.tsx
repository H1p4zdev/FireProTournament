import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/providers/language-provider';
import { useToast } from '@/hooks/use-toast';

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleGetOTP = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we'd call an API to send OTP
    // For this implementation, we'll just show the OTP field
    setOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "A verification code has been sent to your phone"
    });
  };
  
  const handleLogin = async () => {
    if (!phoneNumber || !otp) {
      toast({
        title: "Missing Information",
        description: "Please enter your phone number and OTP",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(phoneNumber, otp);
      
      if (result.success) {
        if (result.isNewUser) {
          // New user - redirect to profile creation
          navigate('/create-profile', { state: { phoneNumber } });
        } else {
          // Existing user - redirect to home
          navigate('/home');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-dark z-40 flex flex-col items-center justify-center px-6">
      <img 
        src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&h=350" 
        alt="Mobile Gaming Tournament" 
        className="w-full max-w-md rounded-xl mb-8"
      />
      
      <h2 className="text-3xl font-bold text-primary font-heading mb-2">{t('common.welcome')}</h2>
      <p className="text-light text-center mb-8">{t('common.welcomeSubtext')}</p>
      
      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="ri-smartphone-line text-gray-400"></i>
          </span>
          <input 
            type="tel" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
            placeholder={t('auth.phoneNumber')}
          />
        </div>
        
        <button 
          onClick={handleGetOTP} 
          disabled={otpSent || isSubmitting}
          className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${(otpSent || isSubmitting) ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
        >
          {otpSent ? t('auth.otpSent') : t('auth.getOTP')}
        </button>
        
        {otpSent && (
          <>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="ri-lock-line text-gray-400"></i>
              </span>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
                placeholder={t('auth.enterOTP')}
              />
            </div>
            
            <button 
              onClick={handleLogin}
              disabled={isSubmitting}
              className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? t('common.loading') : t('auth.verify')}
            </button>
          </>
        )}
        
        <div className="flex items-center justify-center">
          <span className="border-b border-gray-600 flex-grow"></span>
          <span className="px-4 text-gray-400">{t('auth.or')}</span>
          <span className="border-b border-gray-600 flex-grow"></span>
        </div>
        
        <div className="flex space-x-4">
          <button className="flex-1 py-3 bg-[#4267B2] text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center">
            <i className="ri-facebook-fill mr-2"></i> {t('auth.loginWithFacebook')}
          </button>
          <button className="flex-1 py-3 bg-[#DB4437] text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center">
            <i className="ri-google-fill mr-2"></i> {t('auth.loginWithGoogle')}
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400 text-center">
        {t('auth.termsText')} <a href="#" className="text-primary">{t('auth.termsLink')}</a> {t('auth.and')} <a href="#" className="text-primary">{t('auth.privacyLink')}</a>
      </div>
    </div>
  );
}
