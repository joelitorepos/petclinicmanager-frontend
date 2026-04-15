// src/components/layout/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
// import Footer from '../footer/Footer'; // si tienes uno

const PublicLayout = () => {
  return (
    <>
      <Header />
      <main className="pt-5 min-h-screen bg-gray-50">
        <Outlet /> {/* Aquí se renderizan Home, About, etc. */}
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default PublicLayout;