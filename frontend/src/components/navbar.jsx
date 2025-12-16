import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router"
import { logoutUser } from "@/actions/auth-actions"
import Cookies from "js-cookie"


import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";


const NavbarItem = ({ href, children, isActive, onClick }) => {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      onClick={onClick}
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent text-lg",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <NavLink to={href}>{children}</NavLink>
    </Button>
  );
};

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/dashboard", children: "Dashboard" },
]

export const Navbar = () => {
  const { pathname } = useLocation();

  const isAuthenticated = !!Cookies.get("token");

  return (
    <nav className="h-20 w-full flex border-b justify-between items-center font-medium bg-white px-2 lg:px-0">
      <NavLink className="pl-6 flex items-center" to="/">
        <span className="text-3xl lg:text-5xl font-semibold uppercase">
          SPLITWISE
        </span>
      </NavLink>

      {isAuthenticated && (
        <div className="items-center gap-4 hidden lg:flex">
          {navbarItems.map((item) => (
            <NavbarItem
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
            >
              {item.children}
            </NavbarItem>
          ))}
        </div>
      )}

      {isAuthenticated ? (
        <div className="hidden lg:flex">
          <Button
            onClick={logoutUser}
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-20 rounded-none bg-black text-white hover:bg-red-500 hover:text-white transition-colors text-lg"
          >
            LOGOUT
          </Button>
        </div>
      ) : (
        <div className="hidden lg:flex h-full items-center">
          <Button
            asChild
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-20 rounded-none bg-white hover:bg-gray-100 transition-colors text-lg"
          >
            <NavLink to="/login">
              LOGIN
            </NavLink>
          </Button>
          <Button
            asChild
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-20 rounded-none bg-black text-white hover:bg-cyan-400 hover:text-black transition-colors text-lg"
          >
            <NavLink to="/register">
              SIGN UP
            </NavLink>
          </Button>
        </div>
      )}

      {/* Mobile Menu */}
      <div className="lg:hidden pr-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white w-[300px] sm:w-[540px]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex flex-col my-12 h-full">
              {isAuthenticated ? (
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col">
                    {navbarItems.map((item) => (
                      <Button
                        key={item.href}
                        asChild
                        variant="outline"
                        size="lg"
                        className={cn(
                          "bg-transparent hover:text-white hover:bg-black rounded-none border-transparent text-lg",
                          pathname === item.href && "bg-black text-white hover:bg-black hover:text-white"
                        )}
                      >
                        <NavLink to={item.href}>{item.children}</NavLink>
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="lg" onClick={logoutUser} className="bg-transparent hover:bg-transparent hover:border-primary rounded-none border-transparent text-lg">
                    LOGOUT
                  </Button>
                </div>
              ) : (
                <>
                  <NavbarItem href="/login">LOGIN</NavbarItem>
                  <NavbarItem href="/register">SIGN UP</NavbarItem>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

    </nav>
  )
}