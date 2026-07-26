import { ArrowLeft, Loader2, Pencil, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import BottomBar from "../components/layout/BottomBar";

// Motion Variants
const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUserProfile, loading } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", bio: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [submitting, setSubmitting] = useState(false);

    const previewName = form.name.trim() || user?.name || "Your Name";
    const previewEmail = form.email.trim() || user?.email || "your@email.com";
    const previewBio = form.bio.trim() || "Add a short bio to tell people a bit about you.";

    useEffect(() => {
        setForm({
            name: user?.name || "",
            email: user?.email || "",
            bio: user?.bio || "",
        });
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            await updateUserProfile(form);
            setMessage({ type: "success", text: "Profile updated successfully." });
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Unable to update profile." });
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-xs";

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 pb-24">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="mx-auto max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-200/80"
                >
                    {/* Navigation Back Button */}
                    <motion.button
                        whileHover={{ x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </motion.button>

                    {/* Profile Header Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 md:flex-row md:items-center md:justify-between shadow-xs"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 overflow-hidden">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name || "Profile"} className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={28} />
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Pencil size={16} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 tracking-tight">{user?.name || "Guest User"}</h1>
                                <p className="text-xs font-medium text-slate-500">{user?.email || "No email available"}</p>
                            </div>
                        </div>
                        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                            {loading ? "Refreshing your account..." : "Synced with chat account"}
                        </div>
                    </motion.div>

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <motion.label variants={itemVariants} className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Full Name
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Enter your name"
                                />
                            </motion.label>

                            <motion.label variants={itemVariants} className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Email Address
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Enter your email"
                                />
                            </motion.label>
                        </div>

                        <motion.label variants={itemVariants} className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Bio
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                rows="3"
                                className={inputClass}
                                placeholder="Tell people a bit about yourself"
                            />
                        </motion.label>

                        {/* Notification Message */}
                        <AnimatePresence>
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className={`rounded-2xl px-4 py-3 text-xs font-semibold overflow-hidden border ${
                                        message.type === "success" 
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                            : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants} className="flex items-center justify-end pt-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={submitting || loading}
                                className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {submitting ? "Saving..." : "Save Profile"}
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Live Preview Section */}
                    <motion.div variants={itemVariants} className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</h2>
                            <span className="text-[11px] font-medium text-slate-400">Instant updates</span>
                        </div>

                        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-xs font-bold text-white shadow-xs">
                                    {(previewName || "U").slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 text-sm truncate tracking-tight">{previewName}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{previewEmail}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-slate-600 leading-relaxed">{previewBio}</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Fixed Bottom Bar */}
            <BottomBar />
        </div>
    );
};

export default Profile;