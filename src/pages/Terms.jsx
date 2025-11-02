import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Users, FileText, Clock } from 'lucide-react';

const Terms = () => {
  const lastUpdated = "January 15, 2024";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {lastUpdated}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Quick Overview */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Quick Overview</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service govern your use of the EMS (Employee Management System) platform. 
              By accessing or using our service, you agree to be bound by these terms. Please read them carefully.
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="prose prose-gray max-w-none">
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  By creating an account, accessing, or using the EMS platform, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  If you are using the service on behalf of an organization, you represent and warrant that you 
                  have the authority to bind that organization to these terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  EMS is a comprehensive employee management platform that provides:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Employee data management and profiles</li>
                  <li>Attendance tracking and reporting</li>
                  <li>Leave management system</li>
                  <li>Performance evaluation tools</li>
                  <li>Document management</li>
                  <li>Reporting and analytics</li>
                  <li>Multi-tenant organization support</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To use our service, you must create an account and provide accurate, complete information. 
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information remains current and accurate</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-blue-600 mr-3" />
                  4. Data Security and Privacy
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We take data security seriously and implement industry-standard measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Regular security audits and updates</li>
                  <li>Secure data centers with 99.9% uptime</li>
                  <li>GDPR and CCPA compliance</li>
                  <li>Role-based access controls</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  For detailed information about how we collect, use, and protect your data, 
                  please review our <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to use the service to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code or attempt to breach security</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the service for unauthorized commercial purposes</li>
                  <li>Attempt to reverse engineer or copy our software</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Subscription and Billing</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our service is offered on a subscription basis with the following terms:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We may change pricing with 30 days' notice</li>
                  <li>Accounts may be suspended for non-payment</li>
                  <li>You can cancel your subscription at any time</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                  We may temporarily suspend service for:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Scheduled maintenance (with advance notice)</li>
                  <li>Emergency security updates</li>
                  <li>Technical issues beyond our control</li>
                  <li>Violation of these terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To the maximum extent permitted by law, EMS shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including but not limited to 
                  loss of profits, data, or business interruption.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our total liability for any claims arising from these terms or your use of the service 
                  shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Either party may terminate this agreement at any time:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>You may cancel your subscription through your account settings</li>
                  <li>We may terminate accounts that violate these terms</li>
                  <li>Upon termination, your access will cease immediately</li>
                  <li>Data export options are available for 30 days after termination</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  10. Changes to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may update these terms from time to time. When we do:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>We'll notify you via email or in-app notification</li>
                  <li>Changes take effect 30 days after notification</li>
                  <li>Continued use constitutes acceptance of new terms</li>
                  <li>You may terminate your account if you disagree with changes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2"><strong>Email:</strong> legal@ems-platform.com</p>
                  <p className="text-gray-600 mb-2"><strong>Address:</strong> 123 Business Ave, Suite 100, City, State 12345</p>
                  <p className="text-gray-600"><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </section>

            </div>
          </motion.div>

          {/* Footer Navigation */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link 
              to="/privacy" 
              className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600 text-sm">Learn how we protect and handle your data</p>
            </Link>
            <Link 
              to="/contact" 
              className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm">Get in touch with our legal team</p>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;