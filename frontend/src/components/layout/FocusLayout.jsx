import React from 'react';
import Header from './Header';

const FocusLayout = ({ children }) => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Global Header */}
            <div className="shrink-0 z-50 relative shadow-sm bg-white">
                <Header />
            </div>

            {/* Main Content Info Bar (Optional secondary header could go here) */}

            {/* Main Workspace - Fills remaining height */}
            <main className="flex-1 flex min-h-0 relative">
                {children}
            </main>
        </div>
    );
};

export default FocusLayout;
