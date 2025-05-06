import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* App brand */}
      <div className="z-10 w-full max-w-md mx-auto pt-12 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-600">GreenSteps</h1>
          <p className="text-sm text-gray-600">Make eco-friendly habits part of your daily routine</p>
        </div>
      </div>

      {/* Content */}
      <div className="z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 pb-6 text-center text-xs text-gray-500 animate-fade-in">
        <p>© {new Date().getFullYear()} GreenSteps. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout; 