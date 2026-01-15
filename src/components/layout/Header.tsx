
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ViewSwitcher } from "./ViewSwitcher";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 pt-safe-top">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Doctor Auto Prime" className="w-10 h-10 object-contain" />
            <h1 className="font-bold text-lg text-foreground tracking-tight hidden sm:block">
              Doctor Auto Prime
            </h1>
          </div>

          {/* View Switcher - Only for thales */}
          <ViewSwitcher />

          {/* Spacer to balance layout */}
          <div className="w-10" />
        </div>
      </div>
    </header>
  );
}
