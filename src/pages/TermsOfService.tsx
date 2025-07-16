import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, AlertTriangle, Mail, Scale } from "lucide-react";

export default function TermsOfService() {
  return (
    <DocumentLayout currentPage="terms">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these Terms of Service carefully before using the Alset platform. By accessing or using our services, you agree to be bound by these terms.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: December 17, 2024</span>
            </div>
            <Badge variant="outline">Version 1.0</Badge>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning">Important Notice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              These Terms of Service contain important information about your legal rights, remedies, and obligations. Please review them carefully. By using our services, you agree to these terms and our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm grid md:grid-cols-2 gap-2">
              <li><a href="#acceptance" className="text-primary hover:underline">1. Acceptance of Terms</a></li>
              <li><a href="#description" className="text-primary hover:underline">2. Description of Service</a></li>
              <li><a href="#eligibility" className="text-primary hover:underline">3. Eligibility</a></li>
              <li><a href="#accounts" className="text-primary hover:underline">4. User Accounts</a></li>
              <li><a href="#conduct" className="text-primary hover:underline">5. Acceptable Use</a></li>
              <li><a href="#content" className="text-primary hover:underline">6. User Content</a></li>
              <li><a href="#ip" className="text-primary hover:underline">7. Intellectual Property</a></li>
              <li><a href="#payment" className="text-primary hover:underline">8. Payment Terms</a></li>
              <li><a href="#privacy" className="text-primary hover:underline">9. Privacy</a></li>
              <li><a href="#termination" className="text-primary hover:underline">10. Termination</a></li>
              <li><a href="#disclaimers" className="text-primary hover:underline">11. Disclaimers</a></li>
              <li><a href="#liability" className="text-primary hover:underline">12. Limitation of Liability</a></li>
              <li><a href="#indemnification" className="text-primary hover:underline">13. Indemnification</a></li>
              <li><a href="#governing-law" className="text-primary hover:underline">14. Governing Law</a></li>
              <li><a href="#disputes" className="text-primary hover:underline">15. Dispute Resolution</a></li>
              <li><a href="#changes" className="text-primary hover:underline">16. Changes to Terms</a></li>
              <li><a href="#contact" className="text-primary hover:underline">17. Contact Information</a></li>
            </ol>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card id="acceptance">
            <CardHeader>
              <CardTitle className="text-xl">1. Acceptance of Terms</CardTitle>
              <CardDescription>
                By accessing or using Alset's services, you agree to be bound by these Terms of Service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These Terms of Service ("Terms") govern your use of the Alset platform and services (the "Service") operated by Alset Solutions, Inc. ("us", "we", or "our"). By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-sm text-muted-foreground">
                If you disagree with any part of these Terms, then you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card id="description">
            <CardHeader>
              <CardTitle className="text-xl">2. Description of Service</CardTitle>
              <CardDescription>
                Alset provides an AI-powered business transformation platform with intelligent workflows and autonomous agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Core Services</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• AI Endpoints: Universal data intake and processing</li>
                  <li>• Autonomous Agents: Intelligent task execution and decision-making</li>
                  <li>• Workflow Automation: Low-code automation engine</li>
                  <li>• Data Processing: Real-time analytics and transformation</li>
                  <li>• AI-Powered Tools: Productivity and utility applications</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Service Availability</h3>
                <p className="text-sm text-muted-foreground">
                  We strive to provide continuous service availability but cannot guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time with or without notice.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card id="eligibility">
            <CardHeader>
              <CardTitle className="text-xl">3. Eligibility</CardTitle>
              <CardDescription>
                You must meet certain requirements to use our Service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Age Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• You must be at least 18 years old to use our Service</li>
                  <li>• If you are under 18, you may use the Service only with parental consent</li>
                  <li>• We do not knowingly collect information from children under 13</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Authority</h3>
                <p className="text-sm text-muted-foreground">
                  You represent and warrant that you have the legal capacity to enter into these Terms and that you are not prohibited from using the Service under applicable law.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Business Use</h3>
                <p className="text-sm text-muted-foreground">
                  If you are using the Service on behalf of a business or organization, you represent that you have the authority to bind that entity to these Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card id="accounts">
            <CardHeader>
              <CardTitle className="text-xl">4. User Accounts</CardTitle>
              <CardDescription>
                You are responsible for maintaining the security of your account and all activities that occur under your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Account Creation</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• You must provide accurate and complete information when creating an account</li>
                  <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>• You must notify us immediately of any unauthorized use of your account</li>
                  <li>• You may not share your account with others or allow others to use your account</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Account Security</h3>
                <p className="text-sm text-muted-foreground">
                  You are solely responsible for all activities that occur under your account. We recommend using strong passwords and enabling two-factor authentication where available.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Account Termination</h3>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our discretion.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card id="conduct">
            <CardHeader>
              <CardTitle className="text-xl">5. Acceptable Use</CardTitle>
              <CardDescription>
                You agree to use our Service in compliance with all applicable laws and regulations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Prohibited Activities</h3>
                <p className="text-sm text-muted-foreground mb-2">You may not use our Service to:</p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Infringe upon the rights of others</li>
                  <li>• Transmit harmful, offensive, or illegal content</li>
                  <li>• Attempt to gain unauthorized access to systems or accounts</li>
                  <li>• Distribute malware, viruses, or other malicious code</li>
                  <li>• Engage in spam, phishing, or other deceptive practices</li>
                  <li>• Interfere with or disrupt the Service or servers</li>
                  <li>• Reverse engineer, decompile, or disassemble the Service</li>
                  <li>• Use the Service for competitive intelligence or benchmarking</li>
                  <li>• Resell or redistribute the Service without authorization</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  You agree to comply with all applicable laws, regulations, and third-party rights when using our Service. This includes but is not limited to data protection laws, export control laws, and intellectual property rights.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card id="content">
            <CardHeader>
              <CardTitle className="text-xl">6. User Content</CardTitle>
              <CardDescription>
                You retain ownership of your content but grant us certain rights to provide our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Your Content</h3>
                <p className="text-sm text-muted-foreground">
                  You retain all rights to any content you submit, post, or display on or through the Service ("User Content"). You are solely responsible for your User Content and the consequences of posting it.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Content License</h3>
                <p className="text-sm text-muted-foreground">
                  By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, distribute, and display your content solely for the purpose of providing our services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Content Standards</h3>
                <p className="text-sm text-muted-foreground mb-2">Your User Content must not:</p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Infringe upon intellectual property rights</li>
                  <li>• Contain harmful, offensive, or inappropriate material</li>
                  <li>• Include personal information of others without consent</li>
                  <li>• Contain malicious code or security vulnerabilities</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Content Removal</h3>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to remove or modify any User Content that violates these Terms or that we determine is inappropriate for our Service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card id="ip">
            <CardHeader>
              <CardTitle className="text-xl">7. Intellectual Property</CardTitle>
              <CardDescription>
                The Service and its content are protected by intellectual property rights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Our Rights</h3>
                <p className="text-sm text-muted-foreground">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Alset and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Limited License</h3>
                <p className="text-sm text-muted-foreground">
                  We grant you a limited, non-exclusive, non-transferable license to access and use the Service for your internal business purposes, subject to these Terms.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Trademarks</h3>
                <p className="text-sm text-muted-foreground">
                  "Alset" and our logos are trademarks of Alset Solutions, Inc. You may not use our trademarks without our prior written consent.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">DMCA Notice</h3>
                <p className="text-sm text-muted-foreground">
                  We respect intellectual property rights and will respond to valid DMCA takedown notices. If you believe your copyrighted work has been infringed, please contact us at legal@alset.com.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card id="payment">
            <CardHeader>
              <CardTitle className="text-xl">8. Payment Terms</CardTitle>
              <CardDescription>
                Paid services are subject to the payment terms outlined below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Subscription Plans</h3>
                <p className="text-sm text-muted-foreground">
                  We offer various subscription plans with different features and pricing. Current pricing is available on our website and may be updated from time to time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Payment Processing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• All payments are processed securely through third-party payment processors</li>
                  <li>• You authorize us to charge your payment method for applicable fees</li>
                  <li>• Payments are due in advance and are non-refundable unless otherwise stated</li>
                  <li>• You are responsible for all taxes and fees associated with your use of the Service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Billing and Renewals</h3>
                <p className="text-sm text-muted-foreground">
                  Subscriptions automatically renew unless cancelled. You may cancel your subscription at any time through your account settings or by contacting support.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Refund Policy</h3>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee for new subscriptions. Refunds are processed within 5-10 business days to the original payment method.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card id="privacy">
            <CardHeader>
              <CardTitle className="text-xl">9. Privacy</CardTitle>
              <CardDescription>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <p className="text-sm text-muted-foreground">
                                  You can view our complete Privacy Policy at: <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card id="termination">
            <CardHeader>
              <CardTitle className="text-xl">10. Termination</CardTitle>
              <CardDescription>
                Either party may terminate these Terms under certain circumstances.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Termination by You</h3>
                <p className="text-sm text-muted-foreground">
                  You may terminate these Terms at any time by discontinuing your use of the Service and closing your account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Termination by Us</h3>
                <p className="text-sm text-muted-foreground mb-2">We may terminate or suspend your account and access to the Service:</p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• For violation of these Terms</li>
                  <li>• For non-payment of fees</li>
                  <li>• For extended periods of inactivity</li>
                  <li>• For any other reason at our discretion with or without notice</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Effect of Termination</h3>
                <p className="text-sm text-muted-foreground">
                  Upon termination, your right to use the Service will cease immediately. We may delete your account and all associated data. Certain provisions of these Terms will survive termination.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card id="disclaimers">
            <CardHeader>
              <CardTitle className="text-xl">11. Disclaimers</CardTitle>
              <CardDescription>
                The Service is provided "as is" without warranties of any kind.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">IMPORTANT DISCLAIMER</p>
                <p className="text-sm text-muted-foreground">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">No Warranty</h3>
                <p className="text-sm text-muted-foreground mb-2">We do not warrant that:</p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• The Service will be uninterrupted or error-free</li>
                  <li>• The Service will meet your specific requirements</li>
                  <li>• Defects will be corrected</li>
                  <li>• The Service is free of viruses or other harmful components</li>
                  <li>• Results obtained from the Service will be accurate or reliable</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Third-Party Services</h3>
                <p className="text-sm text-muted-foreground">
                  The Service may integrate with third-party services. We are not responsible for the availability, accuracy, or reliability of third-party services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 12 */}
          <Card id="liability">
            <CardHeader>
              <CardTitle className="text-xl">12. Limitation of Liability</CardTitle>
              <CardDescription>
                Our liability is limited to the maximum extent permitted by law.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium mb-2 text-destructive">LIMITATION OF LIABILITY</p>
                <p className="text-sm text-muted-foreground">
                  IN NO EVENT SHALL ALSET BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE SERVICE.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Damage Limitation</h3>
                <p className="text-sm text-muted-foreground">
                  Our total liability for any claims arising out of or relating to these Terms or the Service shall not exceed the amount you paid us in the twelve (12) months preceding the event giving rise to the claim.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Jurisdictional Limitations</h3>
                <p className="text-sm text-muted-foreground">
                  Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 13 */}
          <Card id="indemnification">
            <CardHeader>
              <CardTitle className="text-xl">13. Indemnification</CardTitle>
              <CardDescription>
                You agree to indemnify and hold us harmless from certain claims and damages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You agree to indemnify, defend, and hold harmless Alset, its officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including attorney's fees) arising from:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Your use of the Service</li>
                <li>• Your violation of these Terms</li>
                <li>• Your violation of any third-party rights</li>
                <li>• Your User Content</li>
                <li>• Any fraud or misrepresentation by you</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 14 */}
          <Card id="governing-law">
            <CardHeader>
              <CardTitle className="text-xl">14. Governing Law</CardTitle>
              <CardDescription>
                These Terms are governed by the laws of the jurisdiction where our company is incorporated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of [State/Country], without regard to its conflict of law provisions. You consent to the exclusive jurisdiction of the courts in [Location] for any disputes arising under these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Section 15 */}
          <Card id="disputes">
            <CardHeader>
              <CardTitle className="text-xl">15. Dispute Resolution</CardTitle>
              <CardDescription>
                We prefer to resolve disputes through binding arbitration rather than in court.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Arbitration</h3>
                <p className="text-sm text-muted-foreground">
                  Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Class Action Waiver</h3>
                <p className="text-sm text-muted-foreground">
                  You agree to resolve disputes individually and waive any right to participate in class action lawsuits or class-wide arbitrations.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Exceptions</h3>
                <p className="text-sm text-muted-foreground">
                  Either party may seek injunctive relief in court for intellectual property infringement or other urgent matters.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 16 */}
          <Card id="changes">
            <CardHeader>
              <CardTitle className="text-xl">16. Changes to Terms</CardTitle>
              <CardDescription>
                We may update these Terms from time to time. We will notify you of any material changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website and updating the "Last Updated" date.
              </p>
              <p className="text-sm text-muted-foreground">
                Your continued use of the Service after any changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Service.
              </p>
            </CardContent>
          </Card>

          {/* Section 17 */}
          <Card id="contact">
            <CardHeader>
              <CardTitle className="text-xl">17. Contact Information</CardTitle>
              <CardDescription>
                If you have questions about these Terms, please contact us.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      alsetsolutionsinc@gmail.com
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Legal Department</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alset Solutions, Inc.<br />
                      Legal Department<br />
                      Minneapolis, MN
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    We will respond to your legal inquiries within 5-10 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DocumentLayout>
  );
} 