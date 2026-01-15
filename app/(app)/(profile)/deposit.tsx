import Deposit from '@/components/app/deposit';
import { _UserRole } from '@/features/auth/const';

export default function DepositScreen() {
  return (
    <Deposit useFor={_UserRole.CUSTOMER} />
  )
}
