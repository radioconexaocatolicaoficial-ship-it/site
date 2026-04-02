import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FixedPlayer from "./FixedPlayer";
import CaminhadaPopup from "./CaminhadaPopup";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
    <Header />
    <main className="flex-1 overflow-x-hidden pb-20 md:pb-16">{children}</main>
    <Footer />
    <FixedPlayer />
    <CaminhadaPopup />
  </div>
);

export default Layout;
