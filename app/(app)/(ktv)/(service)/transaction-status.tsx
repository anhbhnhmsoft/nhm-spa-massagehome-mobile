import TransactionStatus from '@/components/app/transaction-status';
import { _UserRole } from '@/features/auth/const';

export default function TransactionStatusScreen() {
  return <TransactionStatus useFor={_UserRole.KTV} />;
}
