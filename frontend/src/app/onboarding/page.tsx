'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, Trophy, Star, Target, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const WHAT_ARE_YOU_BUILDING = [
  'SaaS Startup',
  'Agency',
  'E-commerce Business',
  'Personal Brand',
  'AI Startup',
  'Freelance Business',
  'Still Exploring'
];

const CURRENT_GOALS = [
  'Find Startup Ideas',
  'Build MVP',
  'Get First Customers',
  'Grow Revenue',
  'Learn Marketing',
  'Raise Funding'
];

const EXPERIENCE_LEVELS = [
  'Beginner',
  'Early Founder',
  'Growing Startup',
  'Experienced Founder'
];

const INTERESTS_TOPICS = [
  'Startup Ideas',
  'SaaS Growth',
  'AI & Automation',
  'Marketing',
  'Branding',
  'Fundraising',
  'Leadership',
  'Productivity'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token, loading, refreshUserStats } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push('/login');
      } else if (user && user.onboardingCompleted) {
        router.push('/dashboard');
      }
    }
  }, [user, token, loading, router]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      setError('Please select what you are building to continue.');
      return;
    }
    if (step === 2 && !selectedGoal) {
      setError('Please select your current goal to continue.');
      return;
    }
    if (step === 3 && !selectedStage) {
      setError('Please select your experience level to continue.');
      return;
    }
    if (step === 4 && selectedInterests.length === 0) {
      setError('Please select at least one topic of interest to continue.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);

    // Trigger celebration when entering completion screen
    if (step === 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#FFC247', '#ffffff', '#fb923c']
      });
    }
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        founderRole: selectedRole,
        startupStage: selectedStage,
        interests: selectedInterests,
        goals: [selectedGoal],
        contentPreferences: ['Reading Blogs', 'Weekly Newsletter'],
        skip: false
      };

      await axios.put(`${API_URL}/users/onboarding`, payload, config);

      // Final Confetti Burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFC247', '#ffffff', '#3b82f6']
      });

      await refreshUserStats();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save onboarding details. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-15 rounded-full border-3 border-[#FFC247] border-t-transparent animate-spin" />
        <p className="text-zinc-400 text-xs font-semibold">Loading onboarding profile...</p>
      </div>
    );
  }

  // Animation configurations
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FFC247]/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl space-y-6 relative z-10 text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#FFC247] flex items-center justify-center font-extrabold text-black font-outfit text-sm">D</span>
            <span className="font-outfit font-extrabold text-md text-white">Deven<span className="text-[#FFC247]">Blogs.</span></span>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            Onboarding Setup
          </span>
        </div>

        {/* Wizard Main Card */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
          
          {/* Progress Indicator (Hidden on Completion Screen) */}
          {step <= 4 && (
            <div className="space-y-2 mb-8">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span className="uppercase tracking-wider">Founder Profile Setup</span>
                <span className="text-[#FFC247]">Step {step} of 4</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#FFC247]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Form Errors */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Animated step elements */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-white flex items-center gap-2">
                    <Sparkles className="w-5.5 h-5.5 text-[#FFC247]" />
                    What are you building?
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Select the business type that best describes your project.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WHAT_ARE_YOU_BUILDING.map((role) => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setError('');
                        }}
                        className={`text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-[#FFC247]/10 border-[#FFC247] text-white shadow-lg shadow-[#FFC247]/5'
                            : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span>{role}</span>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-[#FFC247] border-[#FFC247] text-black' 
                            : 'border-zinc-700 group-hover:border-zinc-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-white flex items-center gap-2">
                    <Target className="w-5.5 h-5.5 text-[#FFC247]" />
                    What is your current goal?
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Select the goal that represents your biggest current priority.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CURRENT_GOALS.map((goal) => {
                    const isSelected = selectedGoal === goal;
                    return (
                      <button
                        key={goal}
                        onClick={() => {
                          setSelectedGoal(goal);
                          setError('');
                        }}
                        className={`text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-[#FFC247]/10 border-[#FFC247] text-white shadow-lg shadow-[#FFC247]/5'
                            : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span>{goal}</span>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-[#FFC247] border-[#FFC247] text-black' 
                            : 'border-zinc-700 group-hover:border-zinc-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-white flex items-center gap-2">
                    <Compass className="w-5.5 h-5.5 text-[#FFC247]" />
                    How experienced are you?
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">We personalize recommendations based on your execution stage.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((stage) => {
                    const isSelected = selectedStage === stage;
                    return (
                      <button
                        key={stage}
                        onClick={() => {
                          setSelectedStage(stage);
                          setError('');
                        }}
                        className={`text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-[#FFC247]/10 border-[#FFC247] text-white shadow-lg shadow-[#FFC247]/5'
                            : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span>{stage}</span>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-[#FFC247] border-[#FFC247] text-black' 
                            : 'border-zinc-700 group-hover:border-zinc-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-white flex items-center gap-2">
                    <Trophy className="w-5.5 h-5.5 text-[#FFC247]" />
                    What topics interest you most?
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Select all the tags you would like to see in your feed.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTERESTS_TOPICS.map((topic) => {
                    const isSelected = selectedInterests.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => {
                          toggleInterest(topic);
                          setError('');
                        }}
                        className={`text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#FFC247]/10 border-[#FFC247] text-white shadow shadow-[#FFC247]/5'
                            : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-[#FFC247] border-[#FFC247] text-black' 
                            : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#FFC247]/10 flex items-center justify-center border border-[#FFC247]/20 shadow-lg shadow-[#FFC247]/5 animate-bounce">
                  <Sparkles className="w-8 h-8 text-[#FFC247]" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
                    Welcome to Deven Blogs 🚀
                  </h2>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    "We've personalized your experience based on your startup goals."
                  </p>
                </div>

                <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 w-full max-w-sm flex items-center justify-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold text-zinc-400 text-left">
                    Your preferences have been configured. You are ready to launch.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {step > 1 && step <= 4 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all hover:bg-zinc-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#FFC247] hover:bg-[#ffcd66] text-black text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-outfit shadow-lg shadow-[#FFC247]/20"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-[#FFC247] hover:bg-[#ffcd66] text-black text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-outfit shadow-lg shadow-[#FFC247]/25 w-full sm:w-auto disabled:opacity-55 disabled:cursor-not-allowed"
                id="goto-dashboard-btn"
              >
                {submitting ? 'Setting up...' : 'Go To Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Footer Subtitle */}
        <p className="text-center text-[10px] text-zinc-600 font-sans">
          Your profile configuration is stored securely. You can update these settings later.
        </p>

      </div>
    </div>
  );
}
