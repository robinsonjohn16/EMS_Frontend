import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

const Privacy = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
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
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Your Privacy Matters</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              At EMS, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our employee management platform.
            </p>
          </motion.div>

          {/* Privacy Highlights */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <Lock className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600 text-sm">All sensitive data is encrypted both in transit and at rest using industry-standard protocols.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <Eye className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Practices</h3>
              <p className="text-gray-600 text-sm">We clearly explain what data we collect, why we collect it, and how it's used.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <UserCheck className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
              <p className="text-gray-600 text-sm">You have full control over your data with options to access, modify, or delete it anytime.</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <div className="prose prose-gray max-w-none">
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="w-6 h-6 text-green-600 mr-3" />
                  1. Information We Collect
                </h2>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                  <li>Name, email address, and contact information</li>
                  <li>Job title, department, and employment details</li>
                  <li>Profile photos and identification documents</li>
                  <li>Emergency contact information</li>
                  <li>Banking details for payroll (encrypted and secure)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We automatically collect certain information about your use of our service:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Login times and attendance records</li>
                  <li>Feature usage and interaction patterns</li>
                  <li>Device information and IP addresses</li>
                  <li>Browser type and operating system</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Provide and maintain our employee management services</li>
                  <li>Process attendance, leave requests, and payroll</li>
                  <li>Generate reports and analytics for your organization</li>
                  <li>Communicate with you about your account and services</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in these limited circumstances:
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Within Your Organization</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
                  <li>HR personnel and managers with appropriate access levels</li>
                  <li>Payroll administrators for compensation processing</li>
                  <li>IT administrators for system management</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Providers</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
                  <li>Cloud hosting providers (AWS, Google Cloud)</li>
                  <li>Payment processors for subscription billing</li>
                  <li>Email service providers for notifications</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Requirements</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 text-green-600 mr-3" />
                  4. Data Security
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We implement comprehensive security measures to protect your information:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Safeguards</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• AES-256 encryption</li>
                      <li>• TLS 1.3 for data transmission</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Regular security audits</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Physical Safeguards</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Secure data centers</li>
                      <li>• 24/7 monitoring</li>
                      <li>• Access controls</li>
                      <li>• Backup systems</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  While we use industry-standard security measures, no system is 100% secure. 
                  We continuously monitor and update our security practices to protect your data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have several rights regarding your personal information:
                </p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Access and Portability</h4>
                    <p className="text-gray-600 text-sm">Request a copy of your personal data in a portable format</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Correction</h4>
                    <p className="text-gray-600 text-sm">Update or correct inaccurate personal information</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Deletion</h4>
                    <p className="text-gray-600 text-sm">Request deletion of your personal data (subject to legal requirements)</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900">Restriction</h4>
                    <p className="text-gray-600 text-sm">Limit how we process your personal information</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
                  <li>Provide our services to you and your organization</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Maintain business records for tax and audit purposes</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  When you terminate your account, we will delete or anonymize your personal information 
                  within 90 days, except where retention is required by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 text-green-600 mr-3" />
                  7. International Data Transfers
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Standard Contractual Clauses for EU data transfers</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Certification under privacy frameworks</li>
                  <li>Regular compliance assessments</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
                  <li>Remember your login preferences</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Provide personalized experiences</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  You can control cookie settings through your browser preferences. 
                  Note that disabling certain cookies may affect functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our service is not intended for individuals under 18 years of age. 
                  We do not knowingly collect personal information from children. 
                  If we become aware that we have collected information from a child, 
                  we will take steps to delete such information promptly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. When we do:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>We'll notify you via email or in-app notification</li>
                  <li>We'll post the updated policy on our website</li>
                  <li>We'll update the "Last Updated" date</li>
                  <li>Material changes will be highlighted clearly</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 mb-2"><strong>Privacy Officer:</strong></p>
                      <p className="text-gray-600 mb-2">privacy@ems-platform.com</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2"><strong>Mailing Address:</strong></p>
                      <p className="text-gray-600 mb-2">EMS Privacy Team</p>
                      <p className="text-gray-600 mb-2">123 Business Ave, Suite 100</p>
                      <p className="text-gray-600">City, State 12345</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </motion.div>

          {/* Footer Navigation */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link 
              to="/terms" 
              className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Terms of Service</h3>
              <p className="text-gray-600 text-sm">Review our terms and conditions</p>
            </Link>
            <Link 
              to="/contact" 
              className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm">Get in touch with our privacy team</p>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;