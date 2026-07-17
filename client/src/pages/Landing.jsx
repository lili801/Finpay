import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, Zap, BellRing, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';

export const Landing = ({ initialModal }) => {
  const [activeModal, setActiveModal] = useState(initialModal || null);
  const navigate = useNavigate();

  const handleClose = () => {
    setActiveModal(null);
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple text-white shadow-sm">
              <Wallet className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Fin<span className="text-brand-purple">Pay</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#security" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Security</a>
            <a href="#about" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Developers</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActiveModal('login')}>Sign In</Button>
            <Button size="sm" onClick={() => setActiveModal('register')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-purple">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Modern Financial Tech
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            The Digital Wallet Platform <br />
            For <span className="bg-gradient-to-r from-brand-purple to-indigo-600 bg-clip-text text-transparent">Instant & Secure</span> Payments
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 sm:text-xl">
            Experience lightning fast digital wallet transfers, top-ups, and real-time transaction tracking with enterprise-grade security and administrative audits.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer" onClick={() => setActiveModal('register')}>
              Open Free Account
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto cursor-pointer" onClick={() => setActiveModal('login')}>
              Explore Demo
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Packed with powerful features
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500">
              Built on clean layered architecture, robust model validations, and strict ledger immutability.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feat 1 */}
            <div className="rounded-xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant Transfers</h3>
              <p className="mt-2 text-sm text-slate-500">
                Send funds to any registered user instantly with real-time balance calculations.
              </p>
            </div>
            {/* Feat 2 */}
            <div className="rounded-xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Atomic Transactions</h3>
              <p className="mt-2 text-sm text-slate-500">
                All financial transfers execute in secure isolated MongoDB database sessions.
              </p>
            </div>
            {/* Feat 3 */}
            <div className="rounded-xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple mb-4">
                <BellRing className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Notifications</h3>
              <p className="mt-2 text-sm text-slate-500">
                Receive instant user notifications for every credit, debit, or system action.
              </p>
            </div>
            {/* Feat 4 */}
            <div className="rounded-xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple mb-4">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admin Control</h3>
              <p className="mt-2 text-sm text-slate-500">
                Dedicated management layer for administrators to freeze wallets and audit ledger balances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section id="security" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900 px-6 py-12 sm:px-12 sm:py-16 md:flex md:items-center md:justify-between text-white shadow-xl">
            <div className="md:w-0 md:flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ready to experience secure banking?
              </h2>
              <p className="mt-3 max-w-3xl text-sm text-slate-300">
                FinPay employs industry-standard JWT rotation, bcrypt hashing, and exact integer paise representations to guarantee zero floating point errors or session hijacking.
              </p>
            </div>
            <div className="mt-8 sm:flex md:mt-0 md:ml-8 gap-4">
              <Button className="bg-white text-slate-950 hover:bg-slate-100 focus:ring-white cursor-pointer" onClick={() => setActiveModal('register')}>
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-purple text-white">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-900">
              FinPay
            </span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} FinPay Inc. All rights reserved. Built with React 19, Tailwind v4 and Express.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={activeModal === 'login'} onClose={handleClose}>
        <Login
          isModal={true}
          onSwitchToRegister={() => setActiveModal('register')}
          onSuccess={handleClose}
        />
      </Modal>

      <Modal isOpen={activeModal === 'register'} onClose={handleClose}>
        <Register
          isModal={true}
          onSwitchToLogin={() => setActiveModal('login')}
        />
      </Modal>
    </div>
  );
};
export default Landing;
