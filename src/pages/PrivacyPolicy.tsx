import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <DocumentLayout currentPage="privacy">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This Privacy Policy explains how Alset collects, uses, and protects your information.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: December 17, 2024</span>
            </div>
            <Badge variant="outline">Version 1.0</Badge>
          </div>
        </div>

        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li><a href="#information-collection" className="text-primary hover:underline">1. Information We Collect</a></li>
              <li><a href="#information-use" className="text-primary hover:underline">2. How We Use Your Information</a></li>
              <li><a href="#information-sharing" className="text-primary hover:underline">3. Information Sharing and Disclosure</a></li>
              <li><a href="#data-storage" className="text-primary hover:underline">4. Data Storage and Security</a></li>
              <li><a href="#cookies" className="text-primary hover:underline">5. Cookies and Tracking Technologies</a></li>
              <li><a href="#third-party" className="text-primary hover:underline">6. Third-Party Services</a></li>
              <li><a href="#user-rights" className="text-primary hover:underline">7. Your Rights and Choices</a></li>
              <li><a href="#international" className="text-primary hover:underline">8. International Data Transfers</a></li>
              <li><a href="#children" className="text-primary hover:underline">9. Children's Privacy</a></li>
              <li><a href="#changes" className="text-primary hover:underline">10. Changes to This Privacy Policy</a></li>
              <li><a href="#contact" className="text-primary hover:underline">11. Contact Information</a></li>
            </ol>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Card id="information-collection">
            <CardHeader>
              <CardTitle className="text-xl">1. Information We Collect</CardTitle>
              <CardDescription>
                We collect information you provide directly to us, information we obtain automatically, and information from third parties.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Information You Provide to Us</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Account information (name, email address, password)</li>
                  <li>• Profile information (company details, job title, preferences)</li>
                  <li>• Communications with us (support requests, feedback, surveys)</li>
                  <li>• Payment information (processed securely by third-party providers)</li>
                  <li>• Content you create using our services (workflows, agents, data)</li>
                  <li>• Usage data and analytics from your interactions with our platform</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Information We Collect Automatically</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Device information (IP address, browser type, operating system)</li>
                  <li>• Usage information (pages visited, time spent, features used)</li>
                  <li>• Technical data (cookies, session tokens, API calls)</li>
                  <li>• Performance metrics and error logs</li>
                  <li>• Location data (general geographic location based on IP address)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Information from Third Parties</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>• Authentication providers (Google, GitHub) when you use OAuth</li>
                  <li>• Analytics providers and service integrations</li>
                  <li>• Public databases and data enrichment services</li>
                  <li>• Business partners and referral sources</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card id="information-use">
            <CardHeader>
              <CardTitle className="text-xl">2. How We Use Your Information</CardTitle>
              <CardDescription>
                We use your information to provide, maintain, and improve our services, and to communicate with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Primary Uses</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Provide and maintain our AI platform and services</li>
                    <li>• Process transactions and manage your account</li>
                    <li>• Authenticate users and prevent unauthorized access</li>
                    <li>• Customize your experience and provide personalized content</li>
                    <li>• Analyze usage patterns to improve our services</li>
                    <li>• Provide customer support and respond to inquiries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Communication and Marketing</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Send service-related notifications and updates</li>
                    <li>• Provide technical support and customer service</li>
                    <li>• Send marketing communications (with your consent)</li>
                    <li>• Conduct surveys and gather feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Legal and Security</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Comply with legal obligations and regulatory requirements</li>
                    <li>• Protect against fraud, abuse, and security threats</li>
                    <li>• Enforce our Terms of Service and other agreements</li>
                    <li>• Protect the rights and safety of our users and others</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card id="information-sharing">
            <CardHeader>
              <CardTitle className="text-xl">3. Information Sharing and Disclosure</CardTitle>
              <CardDescription>
                We do not sell your personal information. We may share your information in limited circumstances as described below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Service Providers</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    We may share information with trusted third-party service providers who assist us in operating our platform:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Cloud hosting and infrastructure providers (Supabase, Vercel)</li>
                    <li>• Payment processing services</li>
                    <li>• Analytics and performance monitoring services</li>
                    <li>• Customer support and communication tools</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Legal Requirements</h3>
                  <p className="text-sm text-muted-foreground">
                    We may disclose information if required to do so by law or in response to valid requests by public authorities, including to meet national security or law enforcement requirements.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Business Transfers</h3>
                  <p className="text-sm text-muted-foreground">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction, subject to appropriate confidentiality protections.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Consent</h3>
                  <p className="text-sm text-muted-foreground">
                    We may share information with your explicit consent or at your direction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card id="data-storage">
            <CardHeader>
              <CardTitle className="text-xl">4. Data Storage and Security</CardTitle>
              <CardDescription>
                We implement appropriate technical and organizational measures to protect your information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Security Measures</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Encryption in transit and at rest</li>
                    <li>• Regular security audits and vulnerability assessments</li>
                    <li>• Access controls and authentication mechanisms</li>
                    <li>• Secure development practices and code reviews</li>
                    <li>• Incident response and breach notification procedures</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Data Retention</h3>
                  <p className="text-sm text-muted-foreground">
                    We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Account information is typically retained for the duration of your account plus a reasonable period thereafter.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Data Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is primarily stored and processed in secure data centers. We may transfer data internationally as necessary to provide our services, subject to appropriate safeguards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card id="cookies">
            <CardHeader>
              <CardTitle className="text-xl">5. Cookies and Tracking Technologies</CardTitle>
              <CardDescription>
                We use cookies and similar technologies to enhance your experience and analyze usage patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Types of Cookies</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• <strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                    <li>• <strong>Performance Cookies:</strong> Help us analyze how you use our services</li>
                    <li>• <strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                    <li>• <strong>Targeting Cookies:</strong> Used for personalized content and advertising</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Managing Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    You can control cookies through your browser settings. Please note that disabling certain cookies may impact the functionality of our services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 */}
          <Card id="third-party">
            <CardHeader>
              <CardTitle className="text-xl">6. Third-Party Services</CardTitle>
              <CardDescription>
                Our platform integrates with various third-party services that have their own privacy policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Key Third-Party Services</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• <strong>Supabase:</strong> Database and authentication services</li>
                    <li>• <strong>Vercel:</strong> Hosting and deployment platform</li>
                    <li>• <strong>Google/GitHub:</strong> OAuth authentication providers</li>
                    <li>• <strong>Analytics Providers:</strong> Usage tracking and performance monitoring</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Third-Party Responsibility</h3>
                  <p className="text-sm text-muted-foreground">
                    These third-party services have their own privacy policies and terms of service. We are not responsible for their privacy practices, and we encourage you to review their policies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 */}
          <Card id="user-rights">
            <CardHeader>
              <CardTitle className="text-xl">7. Your Rights and Choices</CardTitle>
              <CardDescription>
                You have various rights regarding your personal information, subject to applicable law.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Access and Control</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Access and review your personal information</li>
                    <li>• Update or correct inaccurate information</li>
                    <li>• Delete your account and associated data</li>
                    <li>• Export your data in a portable format</li>
                    <li>• Opt-out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">European Privacy Rights (GDPR)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    If you are located in the European Economic Area, you have additional rights under GDPR:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Right to rectification of inaccurate data</li>
                    <li>• Right to erasure ("right to be forgotten")</li>
                    <li>• Right to restrict processing</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                    <li>• Right to withdraw consent</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">California Privacy Rights (CCPA)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    California residents have specific rights under the California Consumer Privacy Act:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Right to know what personal information is collected</li>
                    <li>• Right to delete personal information</li>
                    <li>• Right to opt-out of the sale of personal information</li>
                    <li>• Right to non-discrimination for exercising privacy rights</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 */}
          <Card id="international">
            <CardHeader>
              <CardTitle className="text-xl">8. International Data Transfers</CardTitle>
              <CardDescription>
                We may transfer your information internationally to provide our services globally.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As a global service, we may transfer your personal information to countries other than your country of residence. These countries may have different data protection laws than your country.
                </p>

                <div>
                  <h3 className="font-semibold mb-3">Transfer Safeguards</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• Standard Contractual Clauses approved by regulatory authorities</li>
                    <li>• Adequacy decisions by competent authorities</li>
                    <li>• Certification schemes and codes of conduct</li>
                    <li>• Binding corporate rules and similar mechanisms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 9 */}
          <Card id="children">
            <CardHeader>
              <CardTitle className="text-xl">9. Children's Privacy</CardTitle>
              <CardDescription>
                Our services are not intended for children under the age of 13.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We do not knowingly collect personal information from children under 13 years of age. If we discover that we have collected information from a child under 13, we will delete that information promptly.
                </p>

                <p className="text-sm text-muted-foreground">
                  If you are a parent or guardian and believe that your child has provided personal information to us, please contact us immediately so we can take appropriate action.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 10 */}
          <Card id="changes">
            <CardHeader>
              <CardTitle className="text-xl">10. Changes to This Privacy Policy</CardTitle>
              <CardDescription>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We will notify you of any material changes to this Privacy Policy by posting the updated policy on our website and updating the "Last Updated" date. For significant changes, we may also send you an email notification.
                </p>

                <p className="text-sm text-muted-foreground">
                  Your continued use of our services after any changes to this Privacy Policy constitutes acceptance of those changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 11 */}
          <Card id="contact">
            <CardHeader>
              <CardTitle className="text-xl">11. Contact Information</CardTitle>
              <CardDescription>
                If you have questions about this Privacy Policy or our privacy practices, please contact us.
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
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alset Solutions, Inc.<br />
                      Privacy Department<br />
                      Minneapolis, MN
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Data Protection Officer</h3>
                  <p className="text-sm text-muted-foreground">
                    If you are located in the European Economic Area, you may contact our Data Protection Officer at: alsetsolutionsinc@gmail.com
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    We will respond to your privacy-related inquiries within 30 days of receipt, or as otherwise required by applicable law.
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