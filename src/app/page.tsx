import React from 'react';
import Link from 'next/link';
import { Bot, Mic, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-x-hidden relative">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            IO
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            InterviewOS
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-blue-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            AI-Powered Mock Interviews
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white max-w-4xl leading-tight">
            Nail your IT interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">intelligent practice</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            Practice realistic, voice-based technical and behavioral interviews for Software Engineering, Technical Support, and QA roles. Get instant feedback and score higher.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full group">
                Start Practicing Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                See How It Works
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium w-full max-w-3xl">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Voice & Chat Modes</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Feedback</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resume Analysis</div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="py-24 bg-slate-900/50 border-y border-slate-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Complete Interview Suite</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to prepare for your next IT career move.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <Mic className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Conversational AI</h3>
                <p className="text-slate-400 leading-relaxed">
                  Practice with a realistic AI interviewer that listens to your voice, understands context, and asks dynamic follow-up questions.
                </p>
              </div>
              
              <div className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                  <Bot className="text-purple-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tailored to You</h3>
                <p className="text-slate-400 leading-relaxed">
                  Upload your resume and the job description. The AI creates custom scenarios based on your specific skills and the target role.
                </p>
              </div>
              
              <div className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                  <ShieldCheck className="text-emerald-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Actionable Feedback</h3>
                <p className="text-slate-400 leading-relaxed">
                  Get detailed scores on communication, technical knowledge, and confidence, plus a personalized learning roadmap to improve.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported IT Roles</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Specialized interview scenarios for entry-level and mid-level positions.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-2">Software Engineer</h3>
              <ul className="space-y-2 text-slate-400 text-sm mt-4">
                <li>• System Design Basics</li>
                <li>• API Debugging</li>
                <li>• Algorithms & Data Structures</li>
                <li>• Behavioral Scenarios</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-2">Technical Support</h3>
              <ul className="space-y-2 text-slate-400 text-sm mt-4">
                <li>• Network Troubleshooting</li>
                <li>• Angry Customer Handling</li>
                <li>• Ticket Escalation</li>
                <li>• OS Debugging</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-2">QA Tester</h3>
              <ul className="space-y-2 text-slate-400 text-sm mt-4">
                <li>• Test Case Writing</li>
                <li>• Bug Identification</li>
                <li>• Severity vs Priority</li>
                <li>• Automation Basics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10 z-0"></div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to ace your next interview?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of candidates who improved their confidence and landed their dream IT jobs.
            </p>
            <Link href="/signup">
              <Button size="lg" className="shadow-xl shadow-blue-500/20">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-slate-500 text-sm relative z-10 bg-slate-950">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
              IO
            </div>
            <span className="font-semibold text-slate-300">InterviewOS</span>
          </div>
          <p>© {new Date().getFullYear()} InterviewOS AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
