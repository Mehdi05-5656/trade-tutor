import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('sb-jgsijimhctxsieamhjbl-auth-token');

  if (!authCookie) {
    redirect('/login');
  }

  return <>{children}</>;
}
