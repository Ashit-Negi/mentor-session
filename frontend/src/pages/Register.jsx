import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "", // 👈 role added
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 validation
    if (!form.role) {
      alert("Please select a role");
      return;
    }

    try {
      await registerUser(form);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">
          Create Account
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Please register your account!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
            onChange={handleChange}
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
            onChange={handleChange}
          />

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
            onChange={handleChange}
          />

          {/* 🔥 Role Selection */}
          <div className="flex justify-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === "student"}
                onChange={handleChange}
              />
              Student
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="mentor"
                checked={form.role === "mentor"}
                onChange={handleChange}
              />
              Mentor
            </label>
          </div>

          {/* Register Button */}
          <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl transition shadow">
            Register
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-slate-800 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
