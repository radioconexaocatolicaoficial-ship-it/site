import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
    <Header />
    <main className="flex-1 overflow-x-hidden">{children}</main>
    <Footer />
  </div>
);

export default Layout;
