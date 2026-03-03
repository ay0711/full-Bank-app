import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AppProvider } from './context/AppContext';

const BackendLoader = lazy(() => import('./components/BackendLoader'));
const AnimatedSplash = lazy(() => import('./components/AnimatedSplash'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

const Signup = lazy(() => import('./Pages/Signup'));
const Signin = lazy(() => import('./Pages/Signin'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'));
const Dashboard = lazy(() => import('./Pages/DashboardNew'));
const Transfer = lazy(() => import('./Pages/Transfer'));
const Transactions = lazy(() => import('./Pages/Transactions'));
const Profile = lazy(() => import('./Pages/Profile'));
const FundAccount = lazy(() => import('./Pages/FundAccount'));
const Withdraw = lazy(() => import('./Pages/Withdraw'));
const BillPayments = lazy(() => import('./Pages/BillPayments'));
const Savings = lazy(() => import('./Pages/Savings'));
const Loans = lazy(() => import('./Pages/Loans'));
const Me = lazy(() => import('./Pages/Me'));
const Finances = lazy(() => import('./Pages/Finances'));
const Cards = lazy(() => import('./Pages/Cards'));
const AirtimeData = lazy(() => import('./Pages/AirtimeData'));
const Notification = lazy(() => import('./Pages/Notification'));
const Support = lazy(() => import('./Pages/Support'));
const Accounts = lazy(() => import('./Pages/Accounts'));

import './App.css';

const PUBLIC_ROUTES = new Set(['/', '/signin', '/forgot-password']);

const RouteFallback = () => (
  <div style={{ minHeight: '100vh' }} aria-hidden="true" />
);

function AppWrapper() {
  return (
    <AppProvider>
      <Router>
        <App />
      </Router>
    </AppProvider>
  );
}

function App() {
  const [showBackendLoader, setShowBackendLoader] = useState(true);
  const [enableAssistant, setEnableAssistant] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [isLikelyMobile, setIsLikelyMobile] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashKey, setSplashKey] = useState(0);
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.has(location.pathname);

  const shouldShowBackendLoader = useMemo(
    () => showBackendLoader && !PUBLIC_ROUTES.has(location.pathname),
    [showBackendLoader, location.pathname]
  );

  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log(`SW registered: ${reg}`);
          console.log(reg);
        })
        .catch(regError => {
          console.log(`SW registration failed: ${regError}`);
          console.log(regError);
        })
    }

    if (import.meta.env.DEV && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          registrations.forEach(registration => registration.unregister());
        })
        .catch(() => {
        });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const updateMobileFlag = (event) => {
      setIsLikelyMobile(event.matches);
    };

    setIsLikelyMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMobileFlag);
      return () => mediaQuery.removeEventListener('change', updateMobileFlag);
    }

    mediaQuery.addListener(updateMobileFlag);
    return () => mediaQuery.removeListener(updateMobileFlag);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = window.navigator;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const hasLowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;
    const hasLowCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const saveDataEnabled = Boolean(connection?.saveData);
    const slowNetwork = typeof connection?.effectiveType === 'string' && /(^2g$|^slow-2g$)/i.test(connection.effectiveType);
    const prefersReducedMotion = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    const lite = hasLowMemory || hasLowCpu || saveDataEnabled || slowNetwork || prefersReducedMotion;
    setIsLiteMode(lite);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (isLiteMode) {
      root.classList.add('lite-mode');
    } else {
      root.classList.remove('lite-mode');
    }

    return () => {
      root.classList.remove('lite-mode');
    };
  }, [isLiteMode]);

  useEffect(() => {
    if (isPublicRoute || isLiteMode) {
      setEnableAssistant(false);
      return;
    }

    const usesIdleCallback = typeof window.requestIdleCallback === 'function';
    const delay = isLikelyMobile ? 5000 : 2000;
    const idleHandle = usesIdleCallback
      ? window.requestIdleCallback(() => setEnableAssistant(true), { timeout: delay })
      : setTimeout(() => setEnableAssistant(true), delay);

    return () => {
      if (usesIdleCallback && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
    };
  }, [isLikelyMobile, isPublicRoute, isLiteMode]);

  useEffect(() => {
    const usesIdleCallback = typeof window.requestIdleCallback === 'function';
    const idleHandle = usesIdleCallback
      ? window.requestIdleCallback(() => setShowTelemetry(true), { timeout: 4000 })
      : setTimeout(() => setShowTelemetry(true), 2000);

    return () => {
      if (usesIdleCallback && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
    };
  }, []);

  const handleBackendReady = () => {
    setShowBackendLoader(false);
  };

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }

    if (isLikelyMobile || isLiteMode) return;

    setShowSplash(true);
    setSplashKey(prev => prev + 1);
    const timer = setTimeout(() => setShowSplash(false), 700);
    return () => clearTimeout(timer);
  }, [hasMounted, isLikelyMobile, isLiteMode, location.pathname]);

  return (
    <div className="App">
      <Suspense fallback={null}>
        {shouldShowBackendLoader && (
          <BackendLoader
            onReady={handleBackendReady}
            autoStart={true}
          />
        )}
      </Suspense>
      {showSplash && (
        <Suspense fallback={null}>
          <AnimatedSplash show={showSplash} key={splashKey} />
        </Suspense>
      )}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fund-account" element={<FundAccount />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/bill-payments" element={<BillPayments />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/me" element={<Me />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/airtime-data" element={<AirtimeData />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Suspense>
      {enableAssistant && (
        <Suspense fallback={null}>
          <AIAssistant />
        </Suspense>
      )}
      {showTelemetry && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </div>
  );
}
export default AppWrapper;


// Removed duplicate default export
