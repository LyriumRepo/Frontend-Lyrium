import { redirect } from 'next/navigation';

export default function CustomerPage() {
  return redirect('/customer/profile');
}
