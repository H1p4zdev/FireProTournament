import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/use-modal";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface WalletModalProps {
  open: boolean;
}

const PaymentMethod: FC<{ name: string; logo: string; active?: boolean }> = ({
  name, logo, active
}) => (
  <div className="p-3 rounded-lg flex items-center bg-muted">
    <img src={logo} className="w-10 h-10 object-contain rounded-md mr-3" alt={`${name} logo`} />
    <div className="flex-grow">
      <div className="font-medium">{name}</div>
    </div>
    {active ? (
      <i className="ri-check-line text-xl text-success"></i>
    ) : (
      <i className="ri-add-line text-xl text-muted-foreground"></i>
    )}
  </div>
);

const WalletModal: FC<WalletModalProps> = ({ open }) => {
  const { closeWalletModal } = useModals();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { transactions, addFunds, withdrawFunds } = useWallet();
  const { toast } = useToast();

  const handleAddFunds = () => {
    if (!user) return;
    
    addFunds({
      userId: user.id,
      amount: 500,
      type: "deposit",
      status: "completed",
      paymentMethod: "bKash",
      reference: "Added via wallet modal",
    });
    
    toast({
      title: t("fundsAdded"),
      description: t("fundsAddedMessage", { amount: "৳500" }),
    });
  };

  const handleWithdraw = () => {
    if (!user) return;
    
    if (user.walletBalance < 100) {
      toast({
        title: t("insufficientFunds"),
        description: t("insufficientFundsMessage"),
        variant: "destructive",
      });
      return;
    }
    
    withdrawFunds({
      userId: user.id,
      amount: 100,
      type: "withdrawal",
      status: "completed",
      paymentMethod: "bKash",
      reference: "Withdrawal via wallet modal",
    });
    
    toast({
      title: t("fundsWithdrawn"),
      description: t("fundsWithdrawnMessage", { amount: "৳100" }),
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={closeWalletModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("myWallet")}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary to-primary bg-opacity-20 border border-primary border-opacity-30">
          <div className="text-sm mb-1">{t("currentBalance")}</div>
          <div className="text-3xl font-bold font-rajdhani">৳ {user.walletBalance.toLocaleString()}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={handleAddFunds} className="py-3">
            <i className="ri-add-line mr-2"></i>
            {t("addMoney")}
          </Button>
          <Button onClick={handleWithdraw} variant="outline" className="py-3">
            <i className="ri-arrow-down-line mr-2"></i>
            {t("withdraw")}
          </Button>
        </div>
        
        <h3 className="text-lg font-bold mb-4">{t("paymentMethods")}</h3>
        <div className="space-y-3 mb-6">
          <PaymentMethod 
            name="bKash" 
            logo="https://pixabay.com/get/g2e43c768852660b3596f77ba370a3104d3a084242bacdadb78648c1a0f54c261221705dba46e53edbf8202031fd68d6136c489f9877667525fb97a3c3f8d6b5c_1280.jpg" 
            active 
          />
          <PaymentMethod 
            name="Nagad" 
            logo="https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
          />
          <PaymentMethod 
            name="Rocket" 
            logo="https://images.unsplash.com/photo-1607344645866-009c320b63e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
          />
          <PaymentMethod 
            name="SureCash" 
            logo="https://images.unsplash.com/photo-1593672755342-741a7f868732?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" 
          />
        </div>
        
        <h3 className="text-lg font-bold mb-3">{t("recentTransactions")}</h3>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between py-2 border-b border-border"
              >
                <div>
                  <div className="font-medium">
                    {transaction.type === "deposit" && t("addedViaBkash")}
                    {transaction.type === "withdrawal" && t("withdrawal")}
                    {transaction.type === "tournament_entry" && t("tournamentEntry")}
                    {transaction.type === "prize_money" && t("prizeMoney")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={transaction.type === "deposit" || transaction.type === "prize_money" ? "text-success font-medium" : "text-destructive font-medium"}>
                  {transaction.type === "deposit" || transaction.type === "prize_money" ? "+" : "-"}
                  ৳{transaction.amount}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-muted-foreground">
              {t("noTransactions")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
