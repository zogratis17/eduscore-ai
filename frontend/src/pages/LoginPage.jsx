import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/common/Card';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/20 blur-3xl"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-200/20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/30 mb-6">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">Welcome Back</h1>
          <p className="text-secondary-500 mt-2">Sign in to continue to EduScore AI</p>
        </div>

        <Card className="shadow-xl border-secondary-200/60 backdrop-blur-sm bg-white/90">
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-secondary-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <Input 
                    type="email" 
                    placeholder="professor@university.edu" 
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary-700">Password</label>
                  <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {!isLoading && "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-secondary-100 bg-secondary-50/50">
            <p className="text-sm text-secondary-500">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
                Contact Administrator
              </a>
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-secondary-400 mt-8">
          &copy; 2026 EduScore AI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
