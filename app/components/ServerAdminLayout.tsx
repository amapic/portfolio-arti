import { redirect } from 'next/navigation';
import { getAuthFromCookie } from '../../lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  const authData = await getAuthFromCookie();

  if (!authData) {
    redirect('/admin/login');
  }

  // Le composant n'affiche que les enfants si l'utilisateur est authentifié
  return <>{children}</>;
};

export default AdminLayout;