import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Users, 
  Check, 
  X, 
  ArrowRight,
  Star,
  Shield,
  Zap,
  Crown,
  Building,
  Phone,
  Sparkles,
  TrendingUp,
  Lock,
  Clock,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      icon: Users,
      price: {
        monthly: 29,
        yearly: 290
      },
      employees: 'Up to 25 employees',
      features: [
        'Employee profiles & directory',
        'Basic attendance tracking',
        'Leave management',
        'Document storage (5GB)',
        'Email support',
        'Mobile app access',
        'Basic reporting',
        'Single organization'
      ],
      limitations: [
        'No custom fields',
        'No advanced analytics',
        'No API access',
        'No SSO integration'
      ],
      cta: 'Start Free Trial',
      popular: false,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Professional',
      description: 'Ideal for growing organizations',
      icon: Building,
      price: {
        monthly: 59,
        yearly: 590
      },
      employees: 'Up to 100 employees',
      features: [
        'Everything in Starter',
        'Custom employee fields',
        'Advanced reporting & analytics',
        'Performance management',
        'Document storage (50GB)',
        'Priority email & chat support',
        'Workflow automation',
        'Multiple departments',
        'Time tracking',
        'Payroll integration'
      ],
      limitations: [
        'No API access',
        'No SSO integration',
        'No white-label options'
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-primary to-accent'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with advanced needs',
      icon: Crown,
      price: {
        monthly: 'Custom',
        yearly: 'Custom'
      },
      employees: 'Unlimited employees',
      features: [
        'Everything in Professional',
        'Full API access',
        'SSO integration (SAML, OAuth)',
        'White-label options',
        'Unlimited document storage',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Advanced security features',
        'Compliance reporting',
        'Multi-organization support',
        'Custom training & onboarding'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const addOns = [
    {
      name: 'Advanced Analytics',
      description: 'Deep insights with custom dashboards and AI-powered predictions',
      price: { monthly: 15, yearly: 150 },
      icon: TrendingUp,
      gradient: 'from-orange-400 to-red-500'
    },
    {
      name: 'Additional Storage',
      description: '100GB extra secure document storage with encryption',
      price: { monthly: 10, yearly: 100 },
      icon: Lock,
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      name: 'Premium Support',
      description: '24/7 phone support with 1-hour response time SLA',
      price: { monthly: 25, yearly: 250 },
      icon: Phone,
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences. You\'ll never be charged twice for the same period.'
    },
    {
      question: 'What happens if I exceed my employee limit?',
      answer: 'We\'ll notify you when you\'re approaching your limit. You can either upgrade your plan or we\'ll automatically bill you for additional employees at $2 per employee per month. No service interruption ever.'
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer a 25% discount for qualified non-profit organizations and educational institutions. Contact our sales team with your documentation to verify eligibility.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees for any plan. We also provide free data migration assistance and comprehensive onboarding support to help you get started quickly and smoothly.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), ACH transfers, and can arrange invoicing for Enterprise customers. All payments are secured and encrypted.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time with no cancellation fees. You\'ll retain full access until the end of your billing period, and we\'ll help you export your data if needed.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                <Sparkles size={16} className="mr-2" />
                Simple, Transparent Pricing
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Choose Your <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Perfect Plan</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto mb-10"
            >
              No hidden fees, no surprises. Start with a 14-day free trial, no credit card required.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <span className={`text-base sm:text-lg font-medium transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-foreground/50'}`}>
                Monthly
              </span>
              <motion.button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-border"
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="inline-block h-6 w-6 transform rounded-full bg-primary shadow-lg"
                  animate={{
                    x: billingCycle === 'yearly' ? 28 : 4
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
              <span className={`text-base sm:text-lg font-medium transition-colors ${billingCycle === 'yearly' ? 'text-foreground' : 'text-foreground/50'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-2 bg-green-500/20 text-green-600 text-xs sm:text-sm font-bold px-3 py-1 rounded-full border border-green-500/30"
                >
                  Save 17%
                </motion.span>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-foreground/60"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-accent" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: plan.popular ? 1.02 : 1.01 }}
                className={`group relative bg-background/60 backdrop-blur-xl rounded-3xl border overflow-hidden transition-all duration-500 ${
                  plan.popular
                    ? 'border-primary/50 shadow-2xl lg:scale-105 z-10'
                    : 'border-border/50 hover:border-primary/30 shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient text-white text-center py-2.5 text-sm font-bold">
                    <Star className="inline w-4 h-4 mr-1 fill-current" />
                    MOST POPULAR
                  </div>
                )}

                <div className={`p-6 sm:p-8 ${plan.popular ? 'pt-14 sm:pt-16' : ''}`}>
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <plan.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold">{plan.name}</h3>
                      <p className="text-foreground/70 text-sm sm:text-base">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-baseline gap-2">
                      {typeof plan.price[billingCycle] === 'number' ? (
                        <>
                          <span className="text-4xl sm:text-5xl font-bold">
                            ${plan.price[billingCycle]}
                          </span>
                          <span className="text-foreground/60 text-base sm:text-lg">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl sm:text-5xl font-bold">
                          {plan.price[billingCycle]}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/60 mt-2 text-sm sm:text-base">{plan.employees}</p>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                    className={`w-full block text-center py-3 sm:py-4 px-6 rounded-full font-bold text-base sm:text-lg transition-all duration-300 mb-6 sm:mb-8 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gradient-to-r ' + plan.gradient + ' text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <div className="space-y-4 sm:space-y-6">
                    <h4 className="font-bold text-foreground/90 text-sm sm:text-base">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-foreground/70 text-sm sm:text-base">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <>
                        <h4 className="font-bold text-foreground/90 mt-6 text-sm sm:text-base">Not included:</h4>
                        <ul className="space-y-3">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start gap-3">
                              <X size={18} className="text-foreground/30 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground/50 text-sm sm:text-base">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                <Zap size={16} className="mr-2" />
                Power-ups
              </span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Enhance Your Plan</h2>
            <p className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto">
              Add powerful features to any plan to customize your experience
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {addOns.map((addon, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-background/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl relative overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${addon.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${addon.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <addon.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{addon.name}</h3>
                  <p className="text-foreground/70 mb-6 text-sm sm:text-base leading-relaxed">{addon.description}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold">
                      ${addon.price[billingCycle]}
                    </span>
                    <span className="text-foreground/60 text-sm sm:text-base">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                <HelpCircle size={16} className="mr-2" />
                FAQ
              </span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-foreground/70">
              Have questions? We have answers
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{faq.question}</h3>
                    {openFaq === index && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-foreground/70 mt-3 text-sm sm:text-base leading-relaxed"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-foreground/70 mb-4">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Contact our support team
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
              Start Your Free Trial Today
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 mb-10 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of companies already using our platform. 
              <span className="text-primary font-medium"> No credit card required</span>, cancel anytime.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-primary to-accent text-white rounded-full font-bold text-base sm:text-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <span>Start Free Trial</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-block px-8 sm:px-12 py-4 sm:py-5 border-2 border-primary/30 rounded-full font-bold text-base sm:text-xl hover:bg-primary/5 hover:border-primary transition-all duration-300 backdrop-blur-sm"
                >
                  Contact Sales
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-foreground/60"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-accent" />
                <span>Setup in 5 Minutes</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
