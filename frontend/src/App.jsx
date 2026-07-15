import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Call from './pages/Call';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Setting from './pages/Setting';
import VideoMeet from './pages/VideoMeet';
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;
    return user ? children : <Navigate to="/auth" replace />;
};

const App = () => {
    return (
        <div className="h-screen w-full">
            <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/settings" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
                <Route path="/video" element={<ProtectedRoute><VideoMeet /></ProtectedRoute>} />
                <Route path="/call" element={<ProtectedRoute><Call /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </div>
    );
};

export default App;