import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="section py-8 lg:py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            About Our Heritage Collection
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 mx-auto rounded-full"></div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 lg:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐯</span>
              </div>
            </div>
            
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
              Introducing a powerful symbol of heritage and strength to your space with this meticulously handcrafted tiger-head decor, inspired by the iconic Pilivesha (Tiger Dance) of Mangalore. Featuring bold expression, vibrant detailing, and refined craftsmanship, it reflects the rich cultural legacy of Karnataka's coastal region.
            </p>
          </div>

          {/* Perfect For Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">✨</span>
              Designed to enhance a variety of environments:
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "🖥", title: "Office desks", desc: "embody leadership and authority" },
                { icon: "📚", title: "Study tables", desc: "inspire focus and determination" },
                { icon: "🏠", title: "Showcases", desc: "create a striking visual focal point" },
                { icon: "💼", title: "Workspaces", desc: "elevate ambiance with cultural significance" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Craftsmanship Section */}
          <motion.div 
            className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg">⚒️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Exclusive Craftsmanship</h3>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              Each piece is individually sandcrafted, uniquely molded, and mounted on a solid square teak wood base. This design is exclusively available through our store and cannot be found anywhere else in India.
            </p>
          </motion.div>

          {/* Ideal For Section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
              <span className="text-white text-2xl">🎨</span>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Ideal for individuals who value culture, art, and bold aesthetics, this tiger decor makes a refined and impactful statement wherever it's placed.
            </p>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Explore Our Collection
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
