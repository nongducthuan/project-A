import { useState, useContext } from "react";
import API from "../api.jsx";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Destructure setUser function from AuthContext to update the global state
  const { setUser } = useContext(AuthContext);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission (Login logic)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // Send login request to the backend API
      const res = await API.post("/auth/login", form);
      const { user, token } = res.data;

      if (!user || !token) {
        setError("Invalid response from server!");
        return;
      }

      // Store user and token locally for persistence
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      
      // Update global authentication state
      setUser(user);

      // Redirect based on user role
      if (user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      // Display generic error message for security
      setError("Incorrect email/phone number or password!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-100">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign In
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Welcome back!
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              name="identifier"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
              focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Enter email or phone number"
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
              focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Login button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent
              rounded-lg shadow-sm text-lg font-semibold text-white
              bg-violet-600 hover:bg-violet-700
              focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3
            rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Registration Link */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?
            <Link
              to="/register"
              className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}