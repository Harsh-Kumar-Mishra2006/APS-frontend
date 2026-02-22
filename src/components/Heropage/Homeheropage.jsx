// HomeHeroPage.jsx
import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const HomeHeroPage = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  // Interactive mouse move effect for water-like ripple
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const floatAnimation = {
    y: ['0px', '-10px', '0px'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  const glowAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={ref}
    >
      {/* Interactive Water Ripple Background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
        }}
      />
      
      {/* Animated Glassmorphism Layers */}
      <motion.div 
        className="absolute inset-0 backdrop-blur-[100px] bg-white/30"
        animate={glowAnimation}
      />
      
      {/* Floating Orbs with Enhanced Animations */}
      <motion.div 
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full opacity-30"
        animate={{
          ...floatAnimation,
          x: ['0px', '20px', '-10px', '0px'],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div 
        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-40"
        animate={{
          ...floatAnimation,
          x: ['0px', '-15px', '10px', '0px'],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-25"
        animate={{
          ...floatAnimation,
          x: ['0px', '25px', '-15px', '0px'],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Additional Floating Elements */}
      <motion.div 
        className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-pink-400 rounded-full opacity-20"
        animate={{
          y: ['0px', '-30px', '0px'],
          x: ['0px', '20px', '0px'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Content Container */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="text-center">
          {/* School Badge/Logo with Enhanced Animation */}
          <motion.div 
            className="mb-8 flex justify-center"
            variants={itemVariants}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.div 
              className="w-28 h-28 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 backdrop-blur-sm"
              whileHover={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' }}
            >
              <span className="text-white font-bold text-xl tracking-wider">APS</span>
            </motion.div>
          </motion.div>

          {/* Main Heading with Staggered Text Animation */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            <motion.span 
              className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 bg-clip-text text-transparent inline-block"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% auto' }}
            >
              Achievement
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 bg-clip-text text-transparent inline-block"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 1 }}
              style={{ backgroundSize: '200% auto' }}
            >
              Public School
            </motion.span>
          </motion.h1>

          {/* Tagline with Typing Effect */}
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Empowering young minds to achieve excellence through 
            <motion.span 
              className="font-semibold text-blue-700 inline-block mx-1"
              whileHover={{ scale: 1.1, color: '#1e40af' }}
            > innovation</motion.span>, 
            <motion.span 
              className="font-semibold text-yellow-500 inline-block mx-1"
              whileHover={{ scale: 1.1, color: '#eab308' }}
            > creativity</motion.span>, and 
            <motion.span 
              className="font-semibold text-blue-700 inline-block mx-1"
              whileHover={{ scale: 1.1, color: '#1e40af' }}
            > character</motion.span>
          </motion.p>

          {/* Stats Cards with Hover Effects */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            {[
              { number: '25+', label: 'Years of Excellence', color: 'from-teal-400 to-teal-500' },
              { number: '5000+', label: 'Successful Students', color: 'from-lime-400 to-lime-500' },
              { number: '98%', label: 'Academic Success', color: 'from-cyan-400 to-cyan-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="group relative bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/40 overflow-hidden"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Hover Gradient Effect */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />
                
                <motion.div 
                  className="text-4xl font-bold text-blue-900 mb-2 relative z-10"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-700 font-medium relative z-10">{stat.label}</div>
                
                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons with Advanced Animations */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            variants={itemVariants}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white font-semibold rounded-xl shadow-2xl flex items-center gap-2 relative overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(37, 99, 235, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <span className="relative z-10">Explore Admissions</span>
              <motion.svg 
                className="w-5 h-5 relative z-10"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </motion.button>

            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 text-gray-900 font-semibold rounded-xl shadow-2xl flex items-center gap-2 relative overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(234, 179, 8, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -90, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="relative z-10">About Us</span>
            </motion.button>
          </motion.div>

          {/* Quick Features with Hover Animations */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {['STEM Labs', 'Sports Academy', 'Arts Program', 'Global Exchange'].map((feature, index) => (
              <motion.div
                key={index}
                className="relative bg-white/40 backdrop-blur-xl rounded-lg p-4 text-center shadow-xl border border-white/50 overflow-hidden group cursor-pointer"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Feature Icon Placeholder */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20"
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                
                <div className="text-sm font-semibold text-gray-800 relative z-10">
                  {feature}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Wave Divider with Animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <motion.path 
            fill="rgba(255,255,255,0.3)"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            animate={{ 
              d: [
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
          />
        </svg>
      </motion.div>

      {/* Mouse Tracking Water Ripple Effect */}
      {isHovering && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: mousePosition.x + '%',
            top: mousePosition.y + '%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
};

export default HomeHeroPage;