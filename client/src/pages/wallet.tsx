import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/providers/language-provider';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getTransactionIcon, getTransactionColor, getTransactionBgColor } from '@/lib/utils';

export default function Wallet() {
  const { t } = useLanguage();
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();

  // Fetch user transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/users', user?.id, 'transactions'],
    enabled: !!user?.id,
  });

  const handleDeposit = async (amount: number, paymentMethod: string) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/transactions', {
        userId: user.id,
        amount: amount,
        type: 'deposit',
        description: `Deposit via ${paymentMethod}`,
        status: 'completed',
        paymentMethod
      });
      
      toast({
        title: t('common.success'),
        description: t('wallet.depositSuccess'),
      });
      
      // Refresh user data to get updated balance
      refreshUserData();
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: t('common.error'),
        description: t('wallet.depositError'),
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async (amount: number, paymentMethod: string) => {
    if (!user) return;
    
    if ((user.balance || 0) < amount) {
      toast({
        title: t('common.error'),
        description: t('wallet.insufficientBalance'),
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiRequest('POST', '/api/transactions', {
        userId: user.id,
        amount: -amount,
        type: 'withdrawal',
        description: `Withdrawal to ${paymentMethod}`,
        status: 'completed',
        paymentMethod
      });
      
      toast({
        title: t('common.success'),
        description: t('wallet.withdrawalSuccess'),
      });
      
      // Refresh user data to get updated balance
      refreshUserData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: t('common.error'),
        description: t('wallet.withdrawalError'),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-secondary rounded-lg p-4">
        <p className="text-gray-300 text-sm">{t('wallet.totalBalance')}</p>
        <h2 className="text-3xl font-bold text-white mt-1">{formatCurrency(user?.balance || 0)}</h2>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            onClick={() => handleDeposit(100, 'bKash')}
            className="bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center"
          >
            <i className="ri-add-line mr-1"></i> {t('wallet.deposit')}
          </button>
          <button 
            onClick={() => handleWithdraw(50, 'bKash')}
            className="bg-dark-light text-white py-2 rounded-lg font-medium flex items-center justify-center"
          >
            <i className="ri-arrow-right-line mr-1"></i> {t('wallet.withdraw')}
          </button>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-bold font-heading mb-3">{t('wallet.paymentMethods')}</h3>
        
        <div className="bg-dark-light rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="bg-white rounded-lg p-3 flex items-center justify-center cursor-pointer"
              onClick={() => handleDeposit(100, 'bKash')}
            >
              <div className="flex flex-col items-center">
                <i className="ri-wallet-3-line text-2xl text-[#E2136E]"></i>
                <span className="text-black text-sm mt-1">bKash</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-lg p-3 flex items-center justify-center cursor-pointer"
              onClick={() => handleDeposit(100, 'Nagad')}
            >
              <div className="flex flex-col items-center">
                <i className="ri-wallet-3-line text-2xl text-[#F57F20]"></i>
                <span className="text-black text-sm mt-1">Nagad</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-lg p-3 flex items-center justify-center cursor-pointer"
              onClick={() => handleDeposit(100, 'Rocket')}
            >
              <div className="flex flex-col items-center">
                <i className="ri-rocket-line text-2xl text-[#8C3494]"></i>
                <span className="text-black text-sm mt-1">Rocket</span>
              </div>
            </div>
            <div 
              className="bg-white rounded-lg p-3 flex items-center justify-center cursor-pointer"
              onClick={() => handleDeposit(100, 'SureCash')}
            >
              <div className="flex flex-col items-center">
                <i className="ri-secure-payment-line text-2xl text-[#1E88E5]"></i>
                <span className="text-black text-sm mt-1">SureCash</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-bold font-heading mb-3">{t('wallet.recentTransactions')}</h3>
        
        <div className="bg-dark-light rounded-lg divide-y divide-gray-700">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${getTransactionBgColor(transaction.type)} flex items-center justify-center mr-3`}>
                    <i className={`${getTransactionIcon(transaction.type)} ${getTransactionColor(transaction.type)}`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-white">{transaction.description}</p>
                    <p className="text-xs text-gray-400">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`${transaction.amount > 0 ? 'text-success' : 'text-error'} font-medium`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              {t('wallet.noTransactions')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
