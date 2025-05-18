import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
// Remove language import until we implement it properly

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const [, navigate] = useLocation();
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
      // In a real implementation, we would call the login API
      // For now, we'll simulate login by navigating directly
      setTimeout(() => {
        // Direct to home for demo purposes
        navigate('/home');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
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
      
      <h2 className="text-3xl font-bold text-primary font-heading mb-2">Welcome</h2>
      <p className="text-light text-center mb-8">Sign in to continue to FreeFireTournaments</p>
      
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
            placeholder="Phone Number"
          />
        </div>
        
        <button 
          onClick={handleGetOTP} 
          disabled={otpSent || isSubmitting}
          className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${(otpSent || isSubmitting) ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
        >
          {otpSent ? "OTP Sent" : "Get OTP"}
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
                placeholder="Enter OTP"
              />
            </div>
            
            <button 
              onClick={handleLogin}
              disabled={isSubmitting}
              className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? "Loading..." : "Verify"}
            </button>
          </>
        )}
        
        <div className="flex items-center justify-center">
          <span className="border-b border-gray-600 flex-grow"></span>
          <span className="px-4 text-gray-400">OR</span>
          <span className="border-b border-gray-600 flex-grow"></span>
        </div>
        
        <div className="flex space-x-4">
          <button className="flex-1 py-3 bg-[#4267B2] text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center">
            <i className="ri-facebook-fill mr-2"></i> Login with Facebook
          </button>
          <button className="flex-1 py-3 bg-[#DB4437] text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center">
            <i className="ri-google-fill mr-2"></i> Login with Google
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400 text-center">
        By continuing, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
      </div>
    </div>
  );
}
