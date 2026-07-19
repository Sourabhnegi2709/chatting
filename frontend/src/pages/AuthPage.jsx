import { Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
                await signup(formData.name, formData.email, formData.password);
            }
            navigate("/");
        } catch (err) {
            setError(err?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full pl-10 pr-4 py-3 bg-white rounded-xl outline-none border border-zinc-200 transition-all focus:border-[#ff5b52] focus:ring-4 focus:ring-[#ff5b52]/10";

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,91,82,0.16),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center p-4">
            <div className="w-full max-w-6xl min-h-screen md:min-h-[680px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_25px_80px_rgba(15,23,42,0.16)] overflow-hidden flex flex-col md:flex-row">

                {/* Left — brand panel */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#ff5b52] via-[#ff6f62] to-[#ff8b70] relative flex flex-col items-center justify-center text-white py-14 px-6 md:px-0 overflow-hidden">

                    {/* Chat-bubble motif — echoes the product instead of generic circles */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 left-10 w-24 h-12 rounded-2xl rounded-bl-sm bg-white/20"
                    />
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute bottom-16 left-16 w-32 h-10 rounded-2xl rounded-br-sm bg-white/15"
                    />
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/3 right-[-20px] w-28 h-11 rounded-2xl rounded-bl-sm bg-white/25"
                    />

                    <div className="z-10 text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-light mb-3 md:mb-4">
                            Welcome
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl font-light max-w-md">
                            Start meaningful conversations and keep every chat close at hand.
                        </p>
                    </div>
                </div>

                {/* Right — form */}
                <div className="w-full md:w-1/2 bg-[#f3eded] px-6 sm:px-8 md:px-12 py-10 md:py-14 flex flex-col justify-center">
                    <div className="mb-6 md:mb-8 text-center md:text-left">
                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={isLogin ? "login-title" : "signup-title"}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-800"
                            >
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </motion.h2>
                        </AnimatePresence>
                        <p className="text-sm md:text-base text-zinc-500 mt-2">
                            {isLogin ? "Sign in to continue chatting" : "Join to start messaging"}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex mb-6 md:mb-8 bg-white rounded-full p-1 shadow w-full sm:w-fit mx-auto md:mx-0 relative">
                        <motion.div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#ff5b52] rounded-full"
                            animate={{ x: isLogin ? 4 : "calc(100% + 4px)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 flex-1 sm:flex-none px-6 py-2 rounded-full transition-colors ${
                                isLogin ? "text-white" : "text-zinc-700"
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 flex-1 sm:flex-none px-6 py-2 rounded-full transition-colors ${
                                !isLogin ? "text-white" : "text-zinc-700"
                            }`}
                        >
                            Signup
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm overflow-hidden"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative overflow-hidden"
                                >
                                    <User size={18} className="absolute left-3 top-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-4 text-zinc-400" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-4 text-zinc-400" />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#ff5b52] hover:bg-[#e44d45] active:scale-[0.98] text-white rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-70"
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
