import { Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await signup(
                    formData.name,
                    formData.email,
                    formData.password
                );
            }

            navigate("/");
        } catch (err) {
            setError(err?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,91,82,0.16),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center p-4">
            <div className="w-full max-w-6xl min-h-screen md:min-h-[680px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_25px_80px_rgba(15,23,42,0.16)] overflow-hidden flex flex-col md:flex-row">

                {/* Left Section */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#ff5b52] via-[#ff6f62] to-[#ff8b70] relative flex flex-col items-center justify-center text-white py-14 px-6 md:px-0">

                    {/* Floating circles */}
                    <div className="absolute top-6 left-8 md:left-20 w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-white/50 to-transparent"></div>

                    <div className="absolute top-24 md:top-40 left-1/2 w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-b from-white/40 to-transparent"></div>

                    <div className="absolute bottom-8 left-8 md:left-12 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-white/40 to-transparent"></div>

                    <div className="absolute right-[-20px] md:right-[-30px] top-1/2 w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-white/70 to-transparent"></div>

                    {/* Text */}
                    <div className="z-10 text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-light mb-3 md:mb-4">
                            Welcome
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl font-light max-w-md">
                            Start meaningful conversations and keep every chat close at hand.
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="w-full md:w-1/2 bg-[#f3eded] px-6 sm:px-8 md:px-12 py-10 md:py-14 flex flex-col justify-center">

                    <div className="mb-6 md:mb-8 text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-800">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h2>

                        <p className="text-sm md:text-base text-zinc-500 mt-2">
                            {isLogin
                                ? "Sign in to continue chatting"
                                : "Join to start messaging"}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex mb-6 md:mb-8 bg-white rounded-full p-1 shadow w-full sm:w-fit mx-auto md:mx-0">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-full transition ${
                                isLogin
                                    ? "bg-[#ff5b52] text-white"
                                    : "text-zinc-700"
                            }`}
                        >
                            Login
                        </button>

                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-full transition ${
                                !isLogin
                                    ? "bg-[#ff5b52] text-white"
                                    : "text-zinc-700"
                            }`}
                        >
                            Signup
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">

                        {!isLogin && (
                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute left-3 top-4 text-zinc-400"
                                />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl outline-none border border-zinc-200 focus:border-[#ff5b52] focus:ring-2 focus:ring-[#ff5b52]/20"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-4 text-zinc-400"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl outline-none border border-zinc-200 focus:border-[#ff5b52] focus:ring-2 focus:ring-[#ff5b52]/20"
                            />
                        </div>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-4 text-zinc-400"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl outline-none border border-zinc-200 focus:border-[#ff5b52] focus:ring-2 focus:ring-[#ff5b52]/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#ff5b52] hover:bg-[#e44d45] text-white rounded-xl flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : isLogin ? (
                                "Sign In"
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;