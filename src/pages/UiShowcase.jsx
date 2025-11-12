/* Showcase page integrating the provided UI bundle */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Calendar,
	Users,
	Briefcase,
	DollarSign,
	TrendingUp,
	Award,
	Search,
	Filter,
	ChevronDown,
	Star,
	MapPin,
	Clock,
	Building,
	Mail,
	Phone,
	Facebook,
	Twitter,
	Linkedin,
	Instagram,
	Check,
	X,
	Menu,
	ArrowRight,
	BarChart3,
	Target,
	Zap,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const HeroSection = () => {
	const [activeLogin, setActiveLogin] = useState(null);

	return (
		<section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
			<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

			<motion.div
				initial={{ opacity: 0, y: -150, rotate: -3 }}
				animate={{ opacity: 1, y: 0, rotate: 12 }}
				transition={{ duration: 2.4, delay: 0.3, ease: [0.23, 0.86, 0.39, 0.96] }}
				className="absolute left-[-5%] top-[20%] w-[600px] h-[140px] rounded-full bg-gradient-to-r from-indigo-500/[0.15] to-transparent backdrop-blur-[2px] border-2 border-white/[0.15]"
			/>

			<motion.div
				initial={{ opacity: 0, y: -150, rotate: 3 }}
				animate={{ opacity: 1, y: 0, rotate: -15 }}
				transition={{ duration: 2.4, delay: 0.5, ease: [0.23, 0.86, 0.39, 0.96] }}
				className="absolute right-[0%] top-[75%] w-[500px] h-[120px] rounded-full bg-gradient-to-r from-rose-500/[0.15] to-transparent backdrop-blur-[2px] border-2 border-white/[0.15]"
			/>

			<div className="relative z-10 container mx-auto px-4 md:px-6">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.5 }}
						className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
					>
						<div className="h-2 w-2 rounded-full bg-rose-500/80" />
						<span className="text-sm text-white/60 tracking-wide">Event Management Platform</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.7 }}
						className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight"
					>
						<span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Connect Events,</span>
						<br />
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
							Workers & Sponsors
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.9 }}
						className="text-base sm:text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-light max-w-2xl mx-auto"
					>
						The ultimate platform for event organizers, skilled workers, and sponsors to collaborate seamlessly
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 1.1 }}
						className="flex flex-col sm:flex-row gap-4 justify-center items-center"
					>
						<Dialog open={activeLogin === "worker"} onOpenChange={(open) => setActiveLogin(open ? "worker" : null)}>
							<DialogTrigger asChild>
								<Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white">
									<Users className="mr-2 h-5 w-5" />
									Worker Login
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Worker Login</DialogTitle>
									<DialogDescription>Access your worker dashboard</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<Input placeholder="Email" type="email" />
									<Input placeholder="Password" type="password" />
									<Button className="w-full">Sign In</Button>
								</div>
							</DialogContent>
						</Dialog>

						<Dialog
							open={activeLogin === "organizer"}
							onOpenChange={(open) => setActiveLogin(open ? "organizer" : null)}
						>
							<DialogTrigger asChild>
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
								>
									<Calendar className="mr-2 h-5 w-5" />
									Organizer Login
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Organizer Login</DialogTitle>
									<DialogDescription>Access your organizer dashboard</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<Input placeholder="Email" type="email" />
									<Input placeholder="Password" type="password" />
									<Button className="w-full">Sign In</Button>
								</div>
							</DialogContent>
						</Dialog>

						<Dialog open={activeLogin === "sponsor"} onOpenChange={(open) => setActiveLogin(open ? "sponsor" : null)}>
							<DialogTrigger asChild>
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
								>
									<DollarSign className="mr-2 h-5 w-5" />
									Sponsor Login
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Sponsor Login</DialogTitle>
									<DialogDescription>Access your sponsor dashboard</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<Input placeholder="Email" type="email" />
									<Input placeholder="Password" type="password" />
									<Button className="w-full">Sign In</Button>
								</div>
							</DialogContent>
						</Dialog>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

const ProofSection = () => {
	const stats = [
		{ label: "Active Events", value: "2,500+", icon: Calendar },
		{ label: "Skilled Workers", value: "15,000+", icon: Users },
		{ label: "Sponsors", value: "500+", icon: Award },
		{ label: "Success Rate", value: "98%", icon: TrendingUp },
	];

	return (
		<section className="py-20 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">Join thousands of successful events powered by our platform</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					{stats.map((stat, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className="text-center"
						>
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
								<stat.icon className="h-8 w-8 text-primary" />
							</div>
							<div className="text-3xl font-bold mb-2">{stat.value}</div>
							<div className="text-muted-foreground">{stat.label}</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

const FeaturesSection = () => {
	const features = [
		{ icon: Calendar, title: "Event Management", description: "Create and manage events with powerful tools for organizers" },
		{ icon: Users, title: "Worker Marketplace", description: "Connect with skilled professionals for your events" },
		{ icon: DollarSign, title: "Sponsorship Opportunities", description: "Find and manage event sponsorships seamlessly" },
		{ icon: BarChart3, title: "Analytics Dashboard", description: "Track performance with detailed insights and reports" },
		{ icon: Target, title: "Smart Matching", description: "AI-powered matching between events, workers, and sponsors" },
		{ icon: Zap, title: "Real-time Updates", description: "Stay connected with instant notifications and updates" },
	];

	return (
		<section className="py-20 bg-muted/50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to manage events, workers, and sponsorships</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
							<Card>
								<CardHeader>
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
										<feature.icon className="h-6 w-6 text-primary" />
									</div>
									<CardTitle>{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">{feature.description}</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

const PricingSection = () => {
	const plans = [
		{ name: "Worker", price: "Free", description: "Perfect for freelance workers", features: ["Job listings access", "Profile creation", "Basic analytics", "Email support"] },
		{
			name: "Organizer",
			price: "$49",
			description: "For event organizers",
			features: ["Unlimited events", "Worker hiring", "Advanced analytics", "Priority support", "Custom branding"],
			popular: true,
		},
		{
			name: "Sponsor",
			price: "$99",
			description: "For sponsors and brands",
			features: ["Event discovery", "Sponsorship management", "ROI tracking", "Dedicated account manager", "Premium placement"],
		},
	];

	return (
		<section className="py-20 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">Choose the plan that fits your needs</p>
				</div>
				<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{plans.map((plan, index) => (
						<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
							<Card className={plan.popular ? "border-primary shadow-lg" : ""}>
								<CardHeader>
									{plan.popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
									<CardTitle>{plan.name}</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">{plan.price}</span>
										{plan.price !== "Free" && <span className="text-muted-foreground">/month</span>}
									</div>
									<p className="text-muted-foreground mt-2">{plan.description}</p>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3 mb-6">
										{plan.features.map((feature, i) => (
											<li key={i} className="flex items-center gap-2">
												<Check className="h-5 w-5 text-primary" />
												<span>{feature}</span>
											</li>
										))}
									</ul>
									<Button className="w-full" variant={plan.popular ? "default" : "outline"}>
										Get Started
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

const TestimonialsSection = () => {
	const testimonials = [
		{
			name: "Sarah Johnson",
			role: "Event Organizer",
			content:
				"This platform transformed how we manage events. Finding skilled workers has never been easier!",
			avatar:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80 ",
			rating: 5,
		},
		{
			name: "Michael Chen",
			role: "Freelance Worker",
			content:
				"I've found consistent work through this platform. The job matching is incredibly accurate.",
			avatar:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80 ",
			rating: 5,
		},
		{
			name: "Emily Rodriguez",
			role: "Corporate Sponsor",
			content:
				"Great ROI on our sponsorships. The analytics help us make informed decisions.",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80 ",
			rating: 5,
		},
	];

	return (
		<section className="py-20 bg-muted/50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">Hear from organizers, workers, and sponsors who love our platform</p>
				</div>
				<div className="grid md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
							<Card>
								<CardContent className="pt-6">
									<div className="flex gap-1 mb-4">
										{[...Array(testimonial.rating)].map((_, i) => (
											<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
										))}
									</div>
									<p className="text-muted-foreground mb-6">{testimonial.content}</p>
									<div className="flex items-center gap-3">
										<img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
										<div>
											<div className="font-semibold">{testimonial.name}</div>
											<div className="text-sm text-muted-foreground">{testimonial.role}</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

const FAQSection = () => {
	const faqs = [
		{
			question: "How do I get started as a worker?",
			answer:
				"Simply sign up for a free worker account, complete your profile, and start browsing available job listings. You can apply to jobs that match your skills and experience.",
		},
		{
			question: "What's included in the Organizer plan?",
			answer:
				"The Organizer plan includes unlimited event creation, access to our worker marketplace, advanced analytics, priority support, and custom branding options.",
		},
		{
			question: "How does sponsorship matching work?",
			answer:
				"Our AI-powered system matches sponsors with relevant events based on industry, audience demographics, budget, and marketing goals.",
		},
		{
			question: "Can I switch plans later?",
			answer:
				"Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
		},
		{
			question: "What payment methods do you accept?",
			answer:
				"We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.",
		},
	];

	return (
		<section className="py-20 bg-background">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">Find answers to common questions about our platform</p>
				</div>
				<div className="max-w-3xl mx-auto">
					<Accordion type="single" collapsible>
						{faqs.map((faq, index) => (
							<AccordionItem key={index} value={`item-${index}`}>
								<AccordionTrigger>{faq.question}</AccordionTrigger>
								<AccordionContent>{faq.answer}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
};

const ContactSection = () => {
	return (
		<section className="py-20 bg-muted/50">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
						<p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
					</div>
					<div className="grid md:grid-cols-2 gap-8">
						<Card>
							<CardContent className="pt-6">
								<form className="space-y-4">
									<div>
										<Input placeholder="Your Name" />
									</div>
									<div>
										<Input placeholder="Email Address" type="email" />
									</div>
									<div>
										<Input placeholder="Subject" />
									</div>
									<div>
										<textarea
											className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background"
											placeholder="Your Message"
										/>
									</div>
									<Button className="w-full">Send Message</Button>
								</form>
							</CardContent>
						</Card>
						<div className="space-y-6">
							<Card>
								<CardContent className="pt-6">
									<div className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<Mail className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold mb-1">Email</h3>
											<p className="text-muted-foreground">support@eventflex.com</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="pt-6">
									<div className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<Phone className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold mb-1">Phone</h3>
											<p className="text-muted-foreground">+1 (555) 123-4567</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="pt-6">
									<div className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
											<MapPin className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold mb-1">Office</h3>
											<p className="text-muted-foreground">123 Event Street, San Francisco, CA 94102</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

const Footer = () => {
	return (
		<footer className="bg-background border-t py-12">
			<div className="container mx-auto px-4">
				<div className="grid md:grid-cols-4 gap-8 mb-8">
					<div>
						<h3 className="font-bold text-lg mb-4">EventFlex</h3>
						<p className="text-muted-foreground text-sm">Connecting events, workers, and sponsors for successful collaborations.</p>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Platform</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><a href="#" className="hover:text-foreground">For Workers</a></li>
							<li><a href="#" className="hover:text-foreground">For Organizers</a></li>
							<li><a href="#" className="hover:text-foreground">For Sponsors</a></li>
							<li><a href="#" className="hover:text-foreground">Pricing</a></li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Company</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><a href="#" className="hover:text-foreground">About Us</a></li>
							<li><a href="#" className="hover:text-foreground">Careers</a></li>
							<li><a href="#" className="hover:text-foreground">Blog</a></li>
							<li><a href="#" className="hover:text-foreground">Contact</a></li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-4">Legal</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
							<li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
							<li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
						</ul>
					</div>
				</div>
				<div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">© 2024 EventFlex. All rights reserved.</p>
					<div className="flex gap-4">
						<a href="#" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></a>
						<a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
						<a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
						<a href="#" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></a>
					</div>
				</div>
			</div>
		</footer>
	);
};

function EventFlexWebsite() {
	return (
		<div className="min-h-screen bg-background">
			<HeroSection />
			<ProofSection />
			<FeaturesSection />
			<PricingSection />
			<TestimonialsSection />
			<FAQSection />
			<ContactSection />
			<Footer />
		</div>
	);
}

export default function UiShowcase() {
	return <EventFlexWebsite />;
}


