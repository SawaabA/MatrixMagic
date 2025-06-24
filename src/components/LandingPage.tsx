import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Target, 
  Users,
  Star,
  CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Calculator,
      title: 'Interactive Calculators',
      description: 'Powerful matrix operations with step-by-step solutions and visual feedback.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Notes',
      description: 'Theory, examples, and video tutorials for every linear algebra concept.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Trophy,
      title: 'Gamified Practice',
      description: 'Level up your skills with quizzes and earn achievements as you learn.',
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const tools = [
    'Matrix Operations (Add, Subtract, Multiply)',
    'Advanced Functions (Inverse, Determinant, RREF)',
    'Vector Operations (Dot Product, Cross Product)',
    'Decompositions (LU, QR, SVD)',
    'Eigenvalues & Eigenvectors',
    'Step-by-Step Solutions'
  ];

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-theme-bg via-theme-surface to-theme-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-magic-500/10 to-warmAccent-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 text-theme-accent"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Welcome to MatrixMagic</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl lg:text-7xl font-bold text-theme-text leading-tight"
                >
                  Linear Algebra,
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-500 to-warmAccent-500">
                    {' '}Simplified.
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-theme-muted leading-relaxed"
                >
                  Interactive calculators, step-by-step breakdowns, and gamified learning 
                  for first-year students. Master matrices, vectors, and transformations 
                  with confidence.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-magic-500 to-warmAccent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={scrollToFeatures}
                  className="px-8 py-4 border-2 border-theme-border text-theme-text font-semibold rounded-xl hover:border-theme-accent hover:bg-theme-accent/5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  View All Features
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 text-sm text-theme-muted"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Mobile friendly</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-theme-surface rounded-2xl shadow-2xl border border-theme-border p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-magic-400 to-magic-600 rounded-lg">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-text">Matrix Calculator</h3>
                      <p className="text-sm text-theme-muted">Try it now</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      [1, 2, 3],
                      [4, 5, 6],
                      [7, 8, 9]
                    ].map((row, i) => (
                      <div key={i} className="contents">
                        {row.map((cell, j) => (
                          <div
                            key={`${i}-${j}`}
                            className="w-12 h-12 bg-theme-bg border border-theme-border rounded flex items-center justify-center text-theme-text font-mono"
                          >
                            {cell}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-theme-accent/10 text-theme-accent rounded-lg text-sm font-medium">
                      Determinant
                    </button>
                    <button className="flex-1 py-2 bg-theme-border/50 text-theme-muted rounded-lg text-sm font-medium">
                      Inverse
                    </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-theme-accent/5 border border-theme-accent/20 rounded-lg">
                    <div className="text-sm text-theme-muted mb-1">Result:</div>
                    <div className="text-lg font-mono text-theme-accent">det(A) = 0</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-warmAccent-400 to-warmAccent-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-magic-400 to-magic-600 rounded-full opacity-10 animate-pulse"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-theme-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-theme-text mb-4">
              Everything You Need to Master Linear Algebra
            </h2>
            <p className="text-xl text-theme-muted max-w-3xl mx-auto">
              From basic matrix operations to advanced decompositions, 
              we've got you covered with interactive tools and comprehensive learning materials.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group p-8 bg-theme-surface rounded-2xl border border-theme-border hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-theme-text mb-4">{feature.title}</h3>
                <p className="text-theme-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-theme-text mb-6">
                Powerful Tools at Your Fingertips
              </h2>
              <p className="text-xl text-theme-muted mb-8">
                Access a complete suite of linear algebra calculators with step-by-step solutions 
                and interactive visualizations.
              </p>
              
              <div className="grid gap-4">
                {tools.map((tool, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-magic-400 to-magic-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-theme-text font-medium">{tool}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-theme-surface rounded-2xl shadow-xl border border-theme-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-theme-accent" />
                  <h3 className="text-xl font-bold text-theme-text">Step-by-Step Solutions</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-theme-bg rounded-lg border border-theme-border">
                    <div className="text-sm text-theme-muted mb-2">Step 1: Row Operations</div>
                    <div className="font-mono text-theme-text">R₂ → R₂ - 2R₁</div>
                  </div>
                  
                  <div className="p-4 bg-theme-bg rounded-lg border border-theme-border">
                    <div className="text-sm text-theme-muted mb-2">Step 2: Eliminate Column</div>
                    <div className="font-mono text-theme-text">R₃ → R₃ - 3R₁</div>
                  </div>
                  
                  <div className="p-4 bg-theme-accent/10 rounded-lg border border-theme-accent/20">
                    <div className="text-sm text-theme-accent mb-2">Final Result</div>
                    <div className="font-mono text-theme-text">RREF Complete ✓</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-magic-500/10 to-warmAccent-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Calculator, number: '25+', label: 'Calculator Tools' },
              { icon: BookOpen, number: '50+', label: 'Study Topics' },
              { icon: Users, number: '1000+', label: 'Happy Students' },
              { icon: Star, number: '4.9', label: 'Average Rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-magic-400 to-warmAccent-500 rounded-2xl flex items-center justify-center mx-auto">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-theme-text">{stat.number}</div>
                <div className="text-theme-muted font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-theme-text">
              Ready to Master Linear Algebra?
            </h2>
            <p className="text-xl text-theme-muted">
              Join thousands of students who have transformed their understanding 
              of linear algebra with MatrixMagic.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-magic-500 to-warmAccent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Learning Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={scrollToFeatures}
                className="px-8 py-4 border-2 border-theme-border text-theme-text font-semibold rounded-xl hover:border-theme-accent hover:bg-theme-accent/5 transition-all duration-300"
              >
                View All Features
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;