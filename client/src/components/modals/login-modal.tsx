import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModals } from "@/hooks/use-modal";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
}

const LoginModal: FC<LoginModalProps> = ({ open }) => {
  const { closeLoginModal } = useModals();
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (mobile: string) => {
      const response = await apiRequest("POST", "/api/auth/login", { mobileNumber: mobile });
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      closeLoginModal();
      toast({
        title: t("loginSuccess"),
        description: t("welcomeBack"),
      });
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({
        title: t("loginFailed"),
        description: t("loginFailedMessage"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) {
      toast({
        title: t("validationError"),
        description: t("mobileNumberRequired"),
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate(mobileNumber);
  };

  return (
    <Dialog open={open} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("login")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <i className="ri-phone-line"></i>
            </div>
            <Input
              type="tel"
              className="pl-10"
              placeholder={t("mobileNumberPlaceholder")}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              disabled={loginMutation.isPending}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t("loading") : t("continue")}
          </Button>
          
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-sm text-muted-foreground">{t("or")}</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" disabled={loginMutation.isPending}>
              <i className="ri-google-fill text-lg mr-2 text-red-500"></i>
              {t("google")}
            </Button>
            <Button variant="outline" type="button" disabled={loginMutation.isPending}>
              <i className="ri-facebook-fill text-lg mr-2 text-blue-600"></i>
              {t("facebook")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
