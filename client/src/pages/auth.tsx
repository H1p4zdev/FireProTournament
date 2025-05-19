import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { loginWithPhone, verifyOtp } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleGetOTP = async () => {
    // Make sure the phone number is formatted correctly (+880 for Bangladesh)
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    // Basic validation
    if (!formattedPhone || formattedPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g. +8801XXXXXXXXX)",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call Firebase phone authentication
      const result = await loginWithPhone(formattedPhone);
      
      if (result.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone"
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the verification code you received",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verify OTP with Firebase
      const result = await verifyOtp(otp);
      
      if (result.success) {
        if (result.isNewUser) {
          // New user - redirect to profile creation
          navigate('/create-profile');
        } else {
          // Existing user - redirect to home
          navigate('/home');
        }
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
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
            <Phone className="h-5 w-5 text-gray-400" />
          </span>
          <input 
            type="tel" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-dark-light border border-gray-600 rounded-lg focus:outline-none focus:border-primary" 
            placeholder="Phone Number (+8801XXXXXXXXX)"
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
              onClick={handleVerifyOTP}
              disabled={isSubmitting}
              className={`w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition ${isSubmitting ? 'bg-opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>
          </>
        )}
        
        <div className="flex items-center justify-center">
          <span className="border-b border-gray-600 flex-grow"></span>
          <span className="px-4 text-gray-400">OR</span>
          <span className="border-b border-gray-600 flex-grow"></span>
        </div>
        
        <div className="flex space-x-4">
          <button className="flex-1 py-3 bg-[#4267B2] text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center" disabled>
            <i className="ri-facebook-fill mr-2"></i> Login with Facebook
          </button>
          <button className="flex-1 py-3 bg-[#DB4437] text-white rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center" disabled>
            <i className="ri-google-fill mr-2"></i> Login with Google
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400 text-center">
        By continuing, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
      </div>
      
      {/* Hidden recaptcha container for Firebase phone auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
