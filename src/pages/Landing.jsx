"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ArrowRight, Users, MapPin, DollarSign, Settings, BarChart3, Shield } from "lucide-react"
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Custom CSS for additional animations
const customStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(var(--primary), 0.3); }
    50% { box-shadow: 0 0 40px rgba(var(--primary), 0.6); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-gradient {
    background-size: 300% 300%;
    animation: gradient 6s ease infinite;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .shimmer-effect {
    position: relative;
    overflow: hidden;
  }
  
  .shimmer-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shimmer 2s infinite;
  }
  
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

const features = [
  {
    icon: Users,
    title: "Workforce Management",
    description: "Manage employee details, custom fields, and organizational hierarchy with ease.",
  },
  {
    icon: MapPin,
    title: "Geofencing Attendance",
    description: "Track attendance with GPS-based geofencing for accurate location verification.",
  },
  {
    icon: DollarSign,
    title: "Payroll Management",
    description: "Automated payroll processing with tax calculations and compliance.",
  },
  {
    icon: Settings,
    title: "Custom Fields",
    description: "Create custom fields tailored to your organization's unique needs.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive dashboards and reports for data-driven decisions.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Multi-tenant architecture with role-based access control and encryption.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 sm:px-6 lg:px-8">
          {/* Copy + CTAs */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs">
                🚀 Next‑Generation HR Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6"
            >
              Bring clarity to workforce management
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-foreground/70 max-w-xl mb-8"
            >
              Streamline attendance, automate payroll, and empower your team with modern, secure HR tools tailored for scaling organizations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/contact"
                aria-label="Start free trial"
                className="px-6 py-3 bg-primary text-white rounded-full font-semibold text-base hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                to="#features"
                aria-label="View product demo"
                className="px-6 py-3 border border-border rounded-full font-semibold text-base hover:bg-muted/40 transition-colors"
              >
                View Demo
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-6 text-sm text-foreground/60"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                99.9% uptime
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                Enterprise-grade security
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                10k+ teams
              </div>
            </motion.div>
          </div>

          {/* Visual preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl bg-background border border-border/50 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                    <BarChart3 size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Workforce Dashboard</h3>
                    <p className="text-xs text-foreground/60">Real‑time insights</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg p-5 border border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <Users size={20} className="text-primary" />
                    <span className="text-xl font-bold text-primary">94%</span>
                  </div>
                  <h4 className="font-semibold mb-2">Attendance Rate</h4>
                  <div className="w-full bg-primary/20 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>

                <div className="rounded-lg p-5 border border-accent/20 bg-accent/5">
                  <div className="flex items-center justify-between mb-3">
                    <BarChart3 size={20} className="text-accent" />
                    <span className="text-xl font-bold text-accent">+23%</span>
                  </div>
                  <h4 className="font-semibold mb-2">Productivity</h4>
                  <div className="flex items-end gap-1 h-12">
                    {[40, 60, 80, 100, 75].map((h, i) => (
                      <div key={i} className="bg-accent/60 rounded-sm flex-1" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg p-5 border border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign size={20} className="text-green-600" />
                    <span className="text-xl font-bold text-green-600">$2.4M</span>
                  </div>
                  <h4 className="font-semibold mb-1">Monthly Payroll</h4>
                  <p className="text-xs text-foreground/60">Processed automatically</p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-border/40" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                ⚡ Powerful Features
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent"
            >
              Everything Your Team Needs
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-foreground/70 max-w-4xl mx-auto leading-relaxed"
            >
              Streamline operations with our comprehensive suite of workforce management tools. 
              Built for scale, designed for simplicity.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-background/60 backdrop-blur-xl rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl overflow-hidden"
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating Icon Background */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mb-8 group-hover:shadow-lg transition-all duration-300"
                >
                  <feature.icon size={36} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Icon Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                </motion.div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed text-lg group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect Particles */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute bottom-8 right-8 w-1 h-1 bg-accent rounded-full"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute top-12 left-4 w-1.5 h-1.5 bg-primary/60 rounded-full"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                💬 Trusted by Industry Leaders
              </span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
              What Our Clients Say
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Don't just take our word for it. See how companies worldwide are transforming their workforce management.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "HR Director",
                company: "TechCorp Solutions",
                content: "WorkForce has revolutionized how we manage our 500+ employees. The geofencing feature alone has saved us countless hours in attendance tracking.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Operations Manager",
                company: "Global Manufacturing Inc.",
                content: "The payroll automation is incredible. What used to take our team 3 days now happens automatically with 100% accuracy. Game changer!",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emily Rodriguez",
                role: "CEO",
                company: "StartupHub",
                content: "As a growing startup, we needed something scalable and affordable. WorkForce delivered exactly that with an intuitive interface our team loves.",
                rating: 5,
                avatar: "ER"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-background/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
                      >
                        <div className="w-5 h-5 text-yellow-400 fill-current">⭐</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-lg text-foreground/80 mb-8 leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-foreground/60">{testimonial.role}</div>
                      <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Company Logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 text-center"
          >
            <p className="text-sm text-foreground/60 mb-8">Trusted by companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["TechCorp", "GlobalMfg", "StartupHub", "InnovateCo", "ScaleTech"].map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="px-6 py-3 bg-muted/50 rounded-lg font-semibold text-foreground/70 hover:text-foreground transition-all duration-300"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ rotate: -360, y: [0, -30, 0] }}
          transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, y: { duration: 5, repeat: Infinity } }}
          className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-xl"
        />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                🚀 Ready to Get Started?
              </span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-300% animate-gradient">
              Transform Your Workforce Today
            </h2>
            <p className="text-xl md:text-2xl text-foreground/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of companies already using our platform to streamline their HR processes. 
              <span className="text-primary font-medium"> Start your free trial now</span> and see the difference in 24 hours.
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Link
                  to="/contact"
                  className="px-12 py-6 bg-gradient-to-r from-primary to-accent text-white rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-4 relative overflow-hidden"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="#features"
                  className="px-12 py-6 border-2 border-primary/30 rounded-full font-bold text-xl hover:bg-primary/5 hover:border-primary transition-all duration-300 backdrop-blur-sm"
                >
                  Schedule Demo
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-foreground/60"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <span>Setup in Under 5 Minutes</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

