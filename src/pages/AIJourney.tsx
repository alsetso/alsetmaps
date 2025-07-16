import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Target, Rocket, ArrowRight, CheckCircle, Lightbulb, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const journeySteps = [
  {
    icon: Lightbulb,
    title: "Discover Your AI Potential",
    description: "Identify opportunities where AI can transform your business operations and unlock new possibilities."
  },
  {
    icon: Target,
    title: "Define Your Vision",
    description: "Work with our experts to create a clear AI strategy aligned with your business goals and industry needs."
  },
  {
    icon: Users,
    title: "Build Your AI Team",
    description: "Access our network of AI specialists, or let us train your existing team on cutting-edge AI technologies."
  },
  {
    icon: Rocket,
    title: "Launch & Scale",
    description: "Deploy AI solutions that grow with your business, with ongoing support and optimization."
  }
];

const aiCapabilities = [
  {
    title: "Intelligent Automation",
    description: "Automate complex workflows and decision-making processes with AI-powered systems that learn and adapt.",
    benefits: ["Reduce manual work by 80%", "24/7 intelligent operations", "Adaptive learning systems"]
  },
  {
    title: "Predictive Analytics",
    description: "Harness the power of data to predict trends, optimize operations, and make informed decisions.",
    benefits: ["Forecast with 95% accuracy", "Real-time insights", "Data-driven decisions"]
  },
  {
    title: "Natural Language Processing",
    description: "Enable seamless communication between humans and machines through advanced language understanding.",
    benefits: ["Human-like conversations", "Multi-language support", "Context-aware responses"]
  }
];

export default function AIJourney() {
  return (
    <DocumentLayout currentPage="ai-journey">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Brain className="h-4 w-4" />
            Your AI Transformation Begins Here
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
            Unlock the Power of AI for Your Business
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Artificial Intelligence isn't just the future—it's transforming businesses today. 
            Join thousands of organizations already leveraging AI to automate processes, 
            enhance decision-making, and create unprecedented value.
          </p>
        </div>

        {/* Why AI Now Section */}
        <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-primary/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Why AI? Why Now?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The AI revolution is happening whether you're part of it or not. 
                Here's why leading organizations are investing in AI today:
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {aiCapabilities.map((capability, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-xl font-semibold">{capability.title}</h3>
                  <p className="text-muted-foreground">{capability.description}</p>
                  <ul className="space-y-2">
                    {capability.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journey Steps */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your AI Journey in 4 Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've guided hundreds of organizations through their AI transformation. 
              Here's how we'll accelerate your journey:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">Step {index + 1}</div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Success Stories Preview */}
        <Card className="bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Real Results from Real Businesses</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Organizations using our AI platform report significant improvements across key metrics:
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-green-600">85%</div>
                  <div className="text-sm font-medium">Reduction in Processing Time</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">3.2x</div>
                  <div className="text-sm font-medium">Increase in Productivity</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-purple-600">92%</div>
                  <div className="text-sm font-medium">Customer Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Don't let your competitors get ahead. Start your AI transformation today 
                  with alset's comprehensive platform and expert guidance.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="group">
                    <Rocket className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    Get Started Now
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    <Users className="h-5 w-5 mr-2" />
                    Talk to an Expert
                  </Button>
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground">
                🚀 Free consultation • 📊 Custom AI strategy • ⚡ Rapid deployment
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DocumentLayout>
  );
}