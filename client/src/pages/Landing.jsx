import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ShieldCheck,
  Zap,
  BellRing,
  ArrowRight,
  Sparkles,
  UserCheck,
  UserPlus,
  Mail,
  LogIn,
  PlusCircle,
  Send,
  History,
  Lock,
  Server,
  Database,
  ChevronDown,
  Key,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import OtpModal from '../components/auth/OtpModal.jsx';

export const Landing = ({ initialModal }) => {
  const [activeModal, setActiveModal] = useState(initialModal || null);
  const [otpEmail, setOtpEmail] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setActiveModal(null);
    setLoginSuccessMessage('');
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  };

  const faqs = [
    {
      q: 'How do I create a FinPay account?',
      a: 'Clicking "Create Account" or "Get Started" opens the registration modal. Enter your name, email, mobile number, and password. The system will securely register your profile and set up an inactive wallet.',
    },
    {
      q: 'Why is email verification required?',
      a: 'To guarantee ledger authenticity and prevent fraudulent account creation, we require users to verify their email address before accessing transaction and transfer features.',
    },
    {
      q: 'How are transactions secured?',
      a: 'FinPay utilizes database-level atomic transactions (sessions) to execute money transfers. This ensures that the sender is debited and the receiver is credited simultaneously. If any part of the process fails, the entire transaction rolls back automatically, preventing floating-point discrepancies or double-spending.',
    },
    {
      q: 'Can I transfer using only a mobile number?',
      a: 'Yes. The platform maps your secure wallet to your verified mobile number. You can send funds to any other registered user instantly by simply entering their mobile number.',
    },
    {
      q: 'Where can I view my transaction history?',
      a: 'Once authenticated, your dashboard contains a comprehensive ledger of all top-ups, received peer transfers, and sent transfers. You can search, filter by type or status, and verify details for every transaction.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple text-white shadow-md shadow-brand-purple/20">
              <Wallet className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Fin<span className="text-brand-purple">Pay</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-500 hover:text-brand-purple transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-500 hover:text-brand-purple transition-colors duration-200"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="text-sm font-medium text-slate-500 hover:text-brand-purple transition-colors duration-200"
            >
              Security
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-500 hover:text-brand-purple transition-colors duration-200"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-brand-purple font-medium"
              onClick={() => setActiveModal('login')}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-brand-purple hover:bg-brand-purple-dark text-white font-medium shadow-md shadow-brand-purple/10 px-4"
              onClick={() => setActiveModal('register')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Hero Info */}
            <div className="text-left lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple/8 px-3.5 py-1.5 text-xs font-semibold text-brand-purple">
                <Sparkles className="h-3.5 w-3.5" />
                Modern Ledger Architecture
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-tight">
                Secure Digital Wallet <br />
                for{' '}
                <span className="bg-gradient-to-r from-brand-purple to-indigo-600 bg-clip-text text-transparent">
                  Instant Money Transfers
                </span>
              </h1>
              <p className="max-w-xl text-lg text-slate-500 leading-relaxed">
                Send and receive money instantly using just a mobile number. Experience secure wallet management, email verification, and protected transaction tracking with zero floating-point ledger errors.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-dark text-white shadow-lg shadow-brand-purple/15 flex items-center justify-center gap-2 cursor-pointer font-semibold rounded-xl"
                  onClick={() => setActiveModal('register')}
                >
                  Create Account
                  <ArrowRight className="h-4.5 w-4.5" />
                </Button>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto flex items-center justify-center h-12 px-6 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 font-semibold bg-white hover:bg-slate-50 transition-all duration-200 text-center text-sm"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right Hero Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-brand-purple/5 rounded-full blur-3xl -z-10" />
                <svg
                  viewBox="0 0 500 400"
                  className="w-full h-auto drop-shadow-2xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <style>
                    {`
                      @keyframes dash {
                        to {
                          stroke-dashoffset: -20;
                        }
                      }
                      .animate-flow-dash {
                        stroke-dasharray: 6, 6;
                        animation: dash 1.5s linear infinite;
                      }
                    `}
                  </style>

                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="softPurple" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f5f3ff" />
                      <stop offset="100%" stopColor="#e0e7ff" />
                    </linearGradient>
                    <linearGradient id="grayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.08" />
                    </filter>
                  </defs>

                  {/* Decorative Background Grid */}
                  <g stroke="#f1f5f9" strokeWidth="1">
                    <line x1="50" y1="0" x2="50" y2="400" />
                    <line x1="150" y1="0" x2="150" y2="400" />
                    <line x1="250" y1="0" x2="250" y2="400" />
                    <line x1="350" y1="0" x2="350" y2="400" />
                    <line x1="450" y1="0" x2="450" y2="400" />
                    <line x1="0" y1="80" x2="500" y2="80" />
                    <line x1="0" y1="180" x2="500" y2="180" />
                    <line x1="0" y1="280" x2="500" y2="280" />
                  </g>

                  {/* Connecting Node Flow Lines */}
                  <path
                    d="M 120 280 C 120 180, 380 220, 380 120"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 280 C 120 180, 380 220, 380 120"
                    fill="none"
                    stroke="url(#purpleGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-flow-dash"
                  />

                  {/* Node 1: Sender (Bottom Left) */}
                  <g transform="translate(80, 240)" filter="url(#shadow)">
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -10; 0 0"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                      <circle cx="40" cy="40" r="36" fill="white" />
                      <circle cx="40" cy="40" r="28" fill="url(#softPurple)" />
                      {/* User silhouette icon */}
                      <path
                        d="M 32 48 C 32 42, 36 38, 40 38 C 44 38, 48 42, 48 48 M 40 34 C 43.3 34, 46 31.3, 46 28 C 46 24.7, 43.3 22, 40 22 C 36.7 22, 34 24.7, 34 28 C 34 31.3, 36.7 34, 40 34 Z"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>

                  {/* Node 2: Receiver (Top Right) */}
                  <g transform="translate(340, 80)" filter="url(#shadow)">
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -10; 0 0"
                        dur="4s"
                        begin="2s"
                        repeatCount="indefinite"
                      />
                      <circle cx="40" cy="40" r="36" fill="white" />
                      <circle cx="40" cy="40" r="28" fill="url(#softPurple)" />
                      {/* User silhouette icon */}
                      <path
                        d="M 32 48 C 32 42, 36 38, 40 38 C 44 38, 48 42, 48 48 M 40 34 C 43.3 34, 46 31.3, 46 28 C 46 24.7, 43.3 22, 40 22 C 36.7 22, 34 24.7, 34 28 C 34 31.3, 36.7 34, 40 34 Z"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>

                  {/* Center Floating Security Badge */}
                  <g transform="translate(200, 160)" filter="url(#shadow)">
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -10; 0 0"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                      <rect x="0" y="0" width="100" height="80" rx="16" fill="url(#purpleGrad)" />
                      {/* Shield SVG Icon */}
                      <path
                        d="M 50 25 L 68 31 C 68 31, 70 48, 50 61 C 30 48, 32 31, 32 31 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M 45 43 L 49 47 L 55 39"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>

                  {/* Secure Transfer Text Banner */}
                  <g transform="translate(200, 260)" filter="url(#shadow)">
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -10; 0 0"
                        dur="4s"
                        begin="2s"
                        repeatCount="indefinite"
                      />
                      <rect x="0" y="0" width="100" height="28" rx="8" fill="white" />
                      <text
                        x="50"
                        y="18"
                        fill="#334155"
                        fontFamily="system-ui"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Instant Transfer
                      </text>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How FinPay Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How FinPay Works
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-500">
              Follow our simple, realistic system workflow to register, top up your wallet, and securely transfer funds.
            </p>
          </div>

          {/* Timeline Cards Grid */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative">
            {/* Step 1 */}
            <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-brand-purple/20 transition-all duration-300">
              <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-bold text-sm">
                1
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-purple/10">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors">
                Create Account
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                Register inside our secure system with your email, custom password, and mobile number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-brand-purple/20 transition-all duration-300">
              <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-bold text-sm">
                2
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-purple/10">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors">
                Verify Email
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                Confirm your identity by clicking the secure verification link sent to your registration email inbox.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-brand-purple/20 transition-all duration-300">
              <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-bold text-sm">
                3
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-purple/10">
                <LogIn className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors">
                Login Securely
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                Log in to authenticate your session with cryptographically signed JSON Web Tokens (JWT).
              </p>
            </div>

            {/* Step 4 */}
            <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-brand-purple/20 transition-all duration-300">
              <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-bold text-sm">
                4
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-purple/10">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors">
                Add Money
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                Add currency to your wallet. Balance registers instantly inside our immutable database schema.
              </p>
            </div>

            {/* Step 5 */}
            <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-brand-purple/20 transition-all duration-300">
              <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-bold text-sm">
                5
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-purple/10">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors">
                Transfer Funds
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                Transfer money instantly to another active wallet mapped directly to their registered mobile number.
              </p>
            </div>

            {/* Step 6 */}
            <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-brand-purple/20 transition-all duration-300">
              <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple font-bold text-sm">
                6
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-brand-purple/10">
                <History className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-purple transition-colors">
                Track Transactions
              </h3>
              <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                Audit every single transaction with timestamps, details, and exact status tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Packed with powerful features
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-500">
              Built on clean layered architecture, robust database models, and strict ledger immutability.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feat 1 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-5 group-hover:scale-105 transition-transform">
                  <Zap className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Instant Money Transfers</h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  Move funds instantly to other wallets using verified receiver mobile numbers in real-time.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-purple opacity-80 group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feat 2 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-5 group-hover:scale-105 transition-transform">
                  <Wallet className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Wallet Management</h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  Add currency securely, audit your available balance, and manage your wallet configurations.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-purple opacity-80 group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feat 3 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-5 group-hover:scale-105 transition-transform">
                  <History className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Transaction History</h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  View complete client audit-trails. Search transactions and filter by transfer type or status.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-purple opacity-80 group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feat 4 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-5 group-hover:scale-105 transition-transform">
                  <Mail className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Email Verification</h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  Verify user profiles upon signup to guarantee authentication security and ledger credibility.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-purple opacity-80 group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feat 5 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-5 group-hover:scale-105 transition-transform">
                  <Lock className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Secure Authentication</h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  Authentication flows powered by JWT token rotation, cookies, and HTTP security middleware.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-purple opacity-80 group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feat 6 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-5 group-hover:scale-105 transition-transform">
                  <BellRing className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Real-time Notifications</h3>
                <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                  Receive instant system notification alerts for all credits, debits, transfers, and wallet events.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-purple opacity-80 group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-purple/20 via-slate-900/50 to-slate-900 -z-10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Enterprise-grade Security
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              We do not compromise. FinPay uses industry-standard cryptography and secure database mechanics to ensure the safety of every single user account and transaction.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:bg-slate-850 hover:border-slate-700 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple mb-4">
                <Key className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">JWT Authentication</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Stateless session security using secure JSON Web Tokens to authorize dashboard requests and prevent session hijacking.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:bg-slate-850 hover:border-slate-700 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">BCrypt Password Hashing</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                All login passwords are salted and hashed utilizing the robust bcrypt algorithm before storing them in our database.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:bg-slate-850 hover:border-slate-700 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Email Verification</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Mandatory registration verification links prevent automated bot signups and ensure identity credibility.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:bg-slate-850 hover:border-slate-700 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple mb-4">
                <Server className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Protected APIs</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                All backend endpoints perform strict server-side authentication and request body validation checks.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:bg-slate-850 hover:border-slate-700 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Atomic Transactions</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Funds are transferred inside database transactions (sessions). If either wallet updates fail, the session rolls back.
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:bg-slate-850 hover:border-slate-700 transition-all duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-brand-purple mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Secure Wallet</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Maintains wallet balances using exact integers in paise internally, removing rounding issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-500">
              Find answers to commonly asked questions about our application, transaction model, and security.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-xs transition-all duration-350 hover:border-brand-purple/20 hover:bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-brand-purple' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden text-sm text-slate-500 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Ready to Start Using FinPay?
          </h2>
          <p className="max-w-xl mx-auto text-base text-slate-500 leading-relaxed">
            Create your account and experience secure digital wallet transfers.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              className="bg-brand-purple hover:bg-brand-purple-dark text-white shadow-lg shadow-brand-purple/15 cursor-pointer font-semibold rounded-xl px-8"
              onClick={() => setActiveModal('register')}
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple text-white shadow-sm shadow-brand-purple/15">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Fin<span className="text-brand-purple">Pay</span>
              </span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <a
                href="#features"
                className="text-xs font-semibold text-slate-500 hover:text-brand-purple transition-colors uppercase tracking-wider"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-xs font-semibold text-slate-500 hover:text-brand-purple transition-colors uppercase tracking-wider"
              >
                How It Works
              </a>
              <a
                href="#security"
                className="text-xs font-semibold text-slate-500 hover:text-brand-purple transition-colors uppercase tracking-wider"
              >
                Security
              </a>
              <a
                href="#faq"
                className="text-xs font-semibold text-slate-500 hover:text-brand-purple transition-colors uppercase tracking-wider"
              >
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} FinPay Inc. All rights reserved. Built with React, Tailwind and Express.
            </p>
            <p className="text-xs text-slate-400">
              Designed securely with zero float-point ledger error tracking.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={activeModal === 'login'} onClose={handleClose}>
        <Login
          isModal={true}
          successBannerMessage={loginSuccessMessage}
          onSwitchToRegister={() => {
            setLoginSuccessMessage('');
            setActiveModal('register');
          }}
          onOpenOtpModal={(email) => {
            setOtpEmail(email);
            setActiveModal('otp');
          }}
          onSuccess={handleClose}
        />
      </Modal>

      <Modal isOpen={activeModal === 'register'} onClose={handleClose}>
        <Register
          isModal={true}
          onRegistered={(email) => {
            setOtpEmail(email);
            setActiveModal('otp');
          }}
          onSwitchToLogin={() => {
            setLoginSuccessMessage('');
            setActiveModal('login');
          }}
        />
      </Modal>

      <Modal isOpen={activeModal === 'otp'} onClose={handleClose}>
        <OtpModal
          email={otpEmail}
          onSuccess={() => {
            setLoginSuccessMessage('Email verified successfully. Please sign in to continue.');
            setActiveModal('login');
          }}
          onClose={handleClose}
        />
      </Modal>
    </div>
  );
};

export default Landing;
