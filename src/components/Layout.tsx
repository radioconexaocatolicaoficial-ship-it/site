import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FixedPlayer from "./FixedPlayer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
    <Header />
    <main className="flex-1 overflow-x-hidden pb-20 md:pb-16">{children}</main>
    <Footer />
    <FixedPlayer />
  </div>
);

export default Layout;
