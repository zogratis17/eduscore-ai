import React, { useState } from 'react';
import Header from './Header';
import {
    Layout,
    Plus,
    ChevronLeft,
    Menu
} from 'lucide-react';

const StudioLayout = ({
    children,
    sidebarContent,
    rightPanelContent,
    showRightPanel = true
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* 1. Left Sidebar: Navigation & Library */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-16'
                    } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-10 shrink-0`}
            >
                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
                    {isSidebarOpen ? (
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-lg">
                                <Layout className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-gray-800 tracking-tight">EduScore</span>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-lg mx-auto">
                            <Layout className="h-5 w-5 text-white" />
                        </div>
                    )}

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
                    >
                        {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Create New & Rubrics Buttons */}
                <div className="p-4 shrink-0 flex flex-col gap-2">
                    <button
                        onClick={() => { }}
                        className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm ${isSidebarOpen ? 'w-full px-4 py-2.5' : 'p-2.5 rounded-xl'}`}
                        title="New Evaluation"
                    >
                        <Plus className={`${isSidebarOpen ? 'mr-2' : ''} h-5 w-5`} />
                        {isSidebarOpen && <span className="font-medium whitespace-nowrap">New Evaluation</span>}
                    </button>

                    <a
                        href="/rubrics"
                        className={`flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-all ${isSidebarOpen ? 'w-full px-4 py-2.5' : 'p-2.5 rounded-xl'}`}
                        title="Manage Rubrics"
                    >
                        <Settings className={`${isSidebarOpen ? 'mr-2' : ''} h-5 w-5 text-gray-500`} />
                        {isSidebarOpen && <span className="font-medium whitespace-nowrap">Rubrics</span>}
                    </a>
                </div>

                {/* Library List (Passed from Parent) */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
                    {isSidebarOpen ? sidebarContent : (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Menu size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* 2. Main Workspace */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-50 h-screen overflow-hidden">
                {/* Global Header */}
                <div className="shrink-0 z-50 relative shadow-sm">
                    <Header />
                </div>

                <div className="flex-1 overflow-y-auto p-0 relative">
                    {/* Children (AnalysisView or Uploader) take full height */}
                    <div className="h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>

            {/* 3. Right Sidebar: Inspector */}
            {showRightPanel && (
                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
                    {rightPanelContent}
                </aside>
            )}
        </div>
    );
};

export default StudioLayout;
