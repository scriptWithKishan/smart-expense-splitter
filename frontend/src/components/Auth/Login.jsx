import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/actions/auth-actions";
import { useNavigate, Link } from "react-router";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Cookies.get("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-md border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">WELCOME BACK</h2>
        {error && <p className="text-red-500 mb-4 font-bold border-2 border-red-500 p-2 bg-red-50">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">EMAIL</label>
            <Input
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1">PASSWORD</label>
            <Input
              name="password"
              type="password"
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="elevated" className="w-full mt-4 font-bold text-lg">
            LOG IN
          </Button>
        </form>
        <p className="mt-6 text-center font-medium">
          NEW HERE? <Link to="/register" className="underline hover:text-blue-600">CREATE ACCOUNT</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
