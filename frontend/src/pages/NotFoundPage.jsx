import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -mt-64 -ml-64 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute top-1/2 left-1/2 mt-32 ml-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse-soft" />

            <div className="text-center max-w-md relative z-10 animate-fade-in">
                <h1 className="text-[120px] leading-none font-bold text-gradient mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Ready... Aim... Miss.</h2>
                <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                    The page you're looking for doesn't exist, was moved, or has vanished into the AI ether.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/80 shadow-sm transition-all duration-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 text-gray-400" />
                        Go Back
                    </button>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 shadow-sm hover:shadow-glow-sm transition-all duration-200"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
