import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Calendar, 
  BarChart3, 
  Shield, 
  FileText, 
  Settings,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Smartphone,
  Database,
  Bell,
  UserCheck,
  TrendingUp
} from 'lucide-react';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Comprehensive employee profiles with personal information, job details, and organizational hierarchy.",
      benefits: [
        "Centralized employee database",
        "Custom field management",
        "Role-based access control",
        "Employee onboarding workflows"
      ],
      color: "blue"
    },
    {
      icon: Clock,
      title: "Time & Attendance",
      description: "Advanced attendance tracking with multiple clock-in methods and automated reporting.",
      benefits: [
        "Multiple clock-in options",
        "GPS-based location tracking",
        "Overtime calculations",
        "Attendance analytics"
      ],
      color: "green"
    },
    {
      icon: Calendar,
      title: "Leave Management",
      description: "Streamlined leave request and approval process with policy automation.",
      benefits: [
        "Leave balance tracking",
        "Automated approval workflows",
        "Holiday calendar integration",
        "Leave policy enforcement"
      ],
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Powerful insights and customizable reports to drive data-driven decisions.",
      benefits: [
        "Real-time dashboards",
        "Custom report builder",
        "Performance metrics",
        "Export capabilities"
      ],
      color: "orange"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Secure document storage and management with version control and access permissions.",
      benefits: [
        "Secure file storage",
        "Version control",
        "Digital signatures",
        "Compliance tracking"
      ],
      color: "red"
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Flexible system settings to match your organization's unique requirements.",
      benefits: [
        "Custom workflows",
        "Field customization",
        "Integration options",
        "Multi-tenant support"
      ],
      color: "indigo"
    }
  ];

  const additionalFeatures = [
    { icon: Shield, title: "Enterprise Security", description: "Bank-level security with encryption and compliance" },
    { icon: Smartphone, title: "Mobile Ready", description: "Full-featured mobile app for iOS and Android" },
    { icon: Globe, title: "Multi-Language", description: "Support for multiple languages and time zones" },
    { icon: Database, title: "Data Export", description: "Easy data export and backup capabilities" },
    { icon: Bell, title: "Smart Notifications", description: "Intelligent alerts and reminder system" },
    { icon: UserCheck, title: "Self-Service Portal", description: "Employee self-service for common tasks" }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600",
      red: "bg-red-50 border-red-200 text-red-600",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Features</h1>
            <p className="text-xl text-gray-600">Discover the powerful capabilities of our Employee Management System</p>
          </motion.div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to manage your workforce
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From employee onboarding to performance tracking, our comprehensive platform 
            streamlines every aspect of human resource management.
          </p>
        </motion.div>

        {/* Main Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg mb-6 ${getColorClasses(feature.color)}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
              
              <div className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Capabilities</h2>
            <p className="text-xl text-gray-600">More features to enhance your HR operations</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Integration Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <Zap className="w-12 h-12 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
              <p className="text-xl opacity-90 mb-8">
                Connect with your existing tools and systems for a unified workflow
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="font-semibold mb-2">Payroll Systems</h3>
                  <p className="text-sm opacity-90">Integrate with popular payroll providers for seamless salary processing</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="font-semibold mb-2">Communication Tools</h3>
                  <p className="text-sm opacity-90">Connect with Slack, Teams, and email platforms for notifications</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="font-semibold mb-2">Business Intelligence</h3>
                  <p className="text-sm opacity-90">Export data to BI tools for advanced analytics and reporting</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proven Results</h2>
            <p className="text-xl text-gray-600">See how EMS transforms HR operations</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">85%</div>
              <p className="text-gray-600">Reduction in HR admin time</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <p className="text-gray-600">System uptime guarantee</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10k+</div>
              <p className="text-gray-600">Companies trust EMS</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
              <p className="text-gray-600">Customer satisfaction rating</p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to transform your HR operations?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of companies that have streamlined their employee management with EMS.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
              <CheckCircle className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
            >
              Schedule Demo
              <Calendar className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;