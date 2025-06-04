
import { ReactNode } from 'react';
import { PageLayout } from './PageLayout';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return <PageLayout>{children}</PageLayout>;
};

export default MainLayout;
