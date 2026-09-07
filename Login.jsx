import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email');
  const [mode, setMode] = useState('auth');
  const [resetStep, setResetStep] = useState('request');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [resetData, setResetData] = useState({ identifier: '', channel: 'email', otp: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { login, register, apiStr } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'forgot') {
        if (resetStep === 'request') {
          await axios.post(`${apiStr}/auth/forgot-password`, {
            identifier: resetData.identifier,
            channel: resetData.channel,
          });
          setResetStep('verify');
          setError('');
          return;
        }

        if (resetData.newPassword !== resetData.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        await axios.post(`${apiStr}/auth/reset-password`, {
          identifier: resetData.identifier,
          channel: resetData.channel,
          otp: resetData.otp,
          newPassword: resetData.newPassword,
        });
        setMode('auth');
        setIsLogin(true);
        setResetStep('request');
        setFormData((prev) => ({ ...prev, email: resetData.channel === 'email' ? resetData.identifier : prev.email, password: '' }));
        setResetData({ identifier: '', channel: 'email', otp: '', newPassword: '', confirmPassword: '' });
        setError('Password updated. Sign in with your new password.');
        return;
      }

      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        await register(formData.name, formData.email, formData.password, formData.phone);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const openForgotPassword = () => {
    setMode('forgot');
    setResetStep('request');
    setError('');
  };

  const returnToAuth = () => {
    setMode('auth');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden transition-colors">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4 rounded-full border-4 border-brand-blue/20 shadow-lg shadow-brand-blue/30 overflow-hidden bg-white flex items-center justify-center">
            <img src="/logo.jpg" alt="Campus Companion Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-dark to-brand-blue">
            Campus Companion
          </h2>
          <p className="text-gray-500 mt-2 text-sm">Study &#x2022; Organize &#x2022; Achieve</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        {mode === 'forgot' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-semibold dark:text-white">Reset your password</h3>
              <p className="text-sm text-gray-500 mt-1">
                {resetStep === 'request' ? 'Choose where to receive your verification code.' : 'Enter the code and choose a new password.'}
              </p>
            </div>

            {resetStep === 'request' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {['email', 'sms'].map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setResetData({ ...resetData, channel })}
                      className={`py-2 rounded-lg border text-sm font-medium ${resetData.channel === channel ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
                    >
                      {channel === 'email' ? 'Email' : 'Mobile'}
                    </button>
                  ))}
                </div>
                <input
                  type={resetData.channel === 'email' ? 'email' : 'tel'}
                  placeholder={resetData.channel === 'email' ? 'Email Address' : 'Mobile number with country code'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white"
                  value={resetData.identifier}
                  onChange={(e) => setResetData({ ...resetData, identifier: e.target.value })}
                  required
                />
              </>
            ) : (
              <>
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" placeholder="6-digit verification code" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white" value={resetData.otp} onChange={(e) => setResetData({ ...resetData, otp: e.target.value })} required />
                <input type="password" minLength="6" placeholder="New password" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white" value={resetData.newPassword} onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} required />
                <input type="password" minLength="6" placeholder="Confirm new password" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white" value={resetData.confirmPassword} onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })} required />
              </>
            )}

            <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-brand-dark to-brand-blue text-white rounded-xl font-semibold shadow-md shadow-brand-blue/20 hover:scale-[1.02] transition-transform">
              {resetStep === 'request' ? 'Send verification code' : 'Set new password'}
            </button>
            <button type="button" onClick={returnToAuth} className="text-brand-blue hover:text-brand-dark text-sm font-medium transition-colors">Back to sign in</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm text-brand-dark dark:text-blue-100">
                Sign up with your email address to create a Campus Companion account.
              </div>
            )}
            {!isLogin && (
              <>
                <input type="text" placeholder="Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <input type="tel" placeholder="Mobile number (optional)" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </>
            )}
            {isLogin && (
              <div className="grid grid-cols-2 gap-2">
                {['email', 'mobile'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setLoginMethod(method)}
                    className={`py-2 rounded-lg border text-sm font-medium ${loginMethod === method ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
                  >
                    {method === 'email' ? 'Email' : 'Mobile'}
                  </button>
                ))}
              </div>
            )}
            <input
              type={isLogin && loginMethod === 'mobile' ? 'tel' : 'email'}
              placeholder={isLogin && loginMethod === 'mobile' ? 'Mobile number with country code' : 'Email Address'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm password"
                minLength="6"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-blue outline-none transition-all dark:text-white"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            )}
            {isLogin && <button type="button" onClick={openForgotPassword} className="self-end text-brand-blue hover:text-brand-dark text-sm font-medium transition-colors">Forgot password?</button>}
            <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-brand-dark to-brand-blue text-white rounded-xl font-semibold shadow-md shadow-brand-blue/20 hover:scale-[1.02] transition-transform">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        {mode === 'auth' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-brand-blue hover:text-brand-dark text-sm font-medium transition-colors"
            >
              {isLogin ? 'Sign up with email' : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
