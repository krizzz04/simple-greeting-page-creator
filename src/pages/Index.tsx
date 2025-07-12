
import { useState, useEffect } from "react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center px-4 max-w-4xl mx-auto">
        <div
          className={`transition-all duration-1000 ease-out transform ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
            Hello, World!
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Welcome to your new React application
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              Get Started
            </button>
            <button className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-600 hover:text-white transform hover:scale-105 transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
        
        <div
          className={`mt-16 transition-all duration-1000 delay-300 ease-out transform ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast</h3>
              <p className="text-gray-600">Built with modern React and Vite for lightning-fast performance</p>
            </div>
            
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Beautiful</h3>
              <p className="text-gray-600">Styled with Tailwind CSS and Shadcn UI components</p>
            </div>
            
            <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Powerful</h3>
              <p className="text-gray-600">TypeScript support and modern development tools included</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
