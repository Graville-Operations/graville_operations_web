import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/custom/navbar';

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('graville_token');

  if (token?.value) {
    redirect('/home');
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}