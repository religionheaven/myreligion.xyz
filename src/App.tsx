import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Cloud } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { AdminProvider } from './contexts/AdminContext';
import { AuthGuard } from './components/AuthGuard';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminPanel } from './components/admin/AdminPanel';
import { Home } from './components/Home';
import { useAuth } from './contexts/AuthContext';
import { useAdmin } from './contexts/AdminContext';

function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      signUp(formData.username, formData.password).then(({ error }) => {
        if (error) {
          alert(error.message);
        }
      });
    } else {
      signIn(formData.username, formData.password).then(({ error }) => {
        if (error) {
          alert(error.message);
        }
      });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ username: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: 'url(https://i.imgur.com/llHxOih.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="https://i.imgur.com/PlWBSjs.gif"
              alt="Religion Logo"
              className="mx-auto mb-4 w-32 h-auto"
            />
            <h1
              className="text-3xl text-white mb-2"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              religion
            </h1>
          </div>

          {/* Form card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 relative overflow-hidden">
            {/* Radiance effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Toggle buttons */}
                <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-white/20">
                  <button
                    type="button"
                    onClick={() => isSignUp && toggleMode()}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                      !isSignUp
                        ? 'bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => !isSignUp && toggleMode()}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-500 transform hover:scale-105 ${
                      isSignUp
                        ? 'bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Username field */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                {/* Confirm Password field (only for sign up) */}
                {isSignUp && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15"
                      required={isSignUp}
                    />
                  </div>
                )}

                {/* Forgot password (only for sign in) */}
                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-black/80 backdrop-blur-sm text-white py-4 rounded-2xl font-medium hover:bg-black/90 transform hover:scale-[1.02] transition-all duration-500 shadow-2xl hover:shadow-white/20 border border-white/20 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-white hover:text-white/80 font-medium transition-colors duration-300 underline decoration-white/40 hover:decoration-white/80"
                  >
                    {isSignUp ? 'Sign in' : 'Create one'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showRequests, setShowRequests] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Reset app state when user changes
  React.useEffect(() => {
    // Reset modal states when user signs out
    setShowRequests(false);
    setShowAdmin(false);
  }, []);
  return (
    <AuthProvider>
      <AdminProvider>
        <UserProgressProvider>
          <AuthGuard fallback={<AuthForm />}>
            <MainApp
              showRequests={showRequests}
              showAdmin={showAdmin}
              onShowRequests={() => setShowRequests(true)}
              onHideRequests={() => setShowRequests(false)}
              onShowAdmin={() => setShowAdmin(true)}
              onHideAdmin={() => setShowAdmin(false)}
            />
          </AuthGuard>
        </UserProgressProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

function MainApp({
  showRequests,
  showAdmin,
  onShowRequests,
  onHideRequests,
  onShowAdmin,
  onHideAdmin,
}: {
  showRequests: boolean;
  showAdmin: boolean;
  onShowRequests: () => void;
  onHideRequests: () => void;
  onShowAdmin: () => void;
  onHideAdmin: () => void;
}) {
  const { isAdmin } = useAdmin();

  if (showAdmin && isAdmin) {
    return (
      <AdminGuard
        fallback={
          <Home
            showRequests={showRequests}
            onShowRequests={onShowRequests}
            onHideRequests={onHideRequests}
          />
        }
      >
        <AdminPanel onBack={onHideAdmin} />
      </AdminGuard>
    );
  }

  return (
    <Home
      showRequests={showRequests}
      onShowRequests={onShowRequests}
      onHideRequests={onHideRequests}
      onShowAdmin={isAdmin ? onShowAdmin : undefined}
    />
  );
}

export default App;
