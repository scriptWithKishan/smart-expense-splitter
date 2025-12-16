import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import Cookies from "js-cookie"

const Home = () => {
  const isAuthenticated = !!Cookies.get("token");

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-black mb-6 uppercase">
          {isAuthenticated ? "Welcome Back" : "Split Bills without the Headache"}
        </h1>
        <p className="text-xl font-medium mb-8">
          {isAuthenticated ? "Ready to track some more expenses?" : "The brutalist way to track shared expenses. No fluff, just math."}
        </p>
        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="elevated" size="lg" className="text-xl px-8 py-6">Go to Your Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button variant="elevated" size="lg" className="text-xl px-8 py-6">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="elevated" size="lg" className="text-xl px-8 py-6">Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home