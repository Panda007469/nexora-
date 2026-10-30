import { images } from "./images";
import { projects } from "./projects";

export { images };

export const tagline = "From Ideas To Innovation";

export const whatsappNumber = "916369570661";
export const phoneDisplay = "+91 63695 70661";

export interface ContactInfo {
  email: string;
  workingHours: string;
  city: string;
}

export const contact: ContactInfo = {
  email: "contact@nexoratech.com",
  workingHours: "Monday - Friday, 9:00 AM - 6:00 PM IST",
  city: "Bengaluru, India",
};

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: "https://github.com/Panda007469/nexora-", icon: "github" },
  { name: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  { name: "Twitter", url: "https://twitter.com", icon: "twitter" },
];

export const navigation = [
  { name: "Home", to: "/" },
  { name: "Services", to: "/services" },
  { name: "Projects", to: "/projects" },
  { name: "About", to: "/about" },
  { name: "Contact", to: "/contact" },
] as const;

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: string;
  image: string;
  tags: string[];
}

export const services: ServiceItem[] = [
  {
    id: "embedded",
    slug: "embedded-iot-systems",
    name: "Embedded & IoT Systems",
    short: "Small boards. Connected intelligence.",
    description:
      "End-to-end microcontroller firmware, sensor integration, telemetry protocols, and hardware prototyping with ESP32 and ARM.",
    icon: "embedded",
    image: "/images/service-embedded.webp",
    tags: ["Arduino & ESP32", "IoT solutions", "Firmware", "Sensors"],
  },
  {
    id: "vlsi",
    slug: "vlsi-projects-course",
    name: "VLSI Projects & Course",
    short: "Silicon-level logic and verification.",
    description:
      "Digital IC design, Verilog/VHDL logic synthesis, FPGA prototyping, and comprehensive curriculum-aligned course guidance.",
    icon: "hardware",
    image: "/images/service-vlsi.webp",
    tags: ["Verilog / VHDL", "FPGA Prototyping", "RTL Simulation", "ASIC Flow"],
  },
  {
    id: "software",
    slug: "software-projects",
    name: "Software Projects",
    short: "Robust web, cloud, and systems architecture.",
    description:
      "Full-stack web applications, real-time dashboards, APIs, and scalable software pipelines built with modern engineering stacks.",
    icon: "frontend",
    image: "/images/service-software.webp",
    tags: ["React & TypeScript", "Cloud APIs", "Database Design", "Full Stack"],
  },
  {
    id: "academic",
    slug: "academic-solutions",
    name: "Academic Solutions",
    short: "Comprehensive mentorship and documentation.",
    description:
      "Capstone engineering guidance, IEEE research implementation, detailed technical reporting, and defense preparation.",
    icon: "advice",
    image: "/images/service-academic.webp",
    tags: ["Project guidance", "IEEE Implementations", "Technical Documentation", "Defense Prep"],
  },
];

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Share Idea",
    description: "Submit your problem statement, technical requirements, and target timeline.",
  },
  {
    step: 2,
    title: "Review",
    description: "Our technical team reviews feasibility, component availability, and architecture.",
  },
  {
    step: 3,
    title: "Consultation",
    description: "Schedule a one-on-one session to align on tech stack, scope, and deliverables.",
  },
  {
    step: 4,
    title: "Quote",
    description: "Receive a clear milestone breakdown, transparent schedule, and fixed budget quote.",
  },
  {
    step: 5,
    title: "Build",
    description: "Iterative hardware/software sprint execution with continuous progress updates.",
  },
  {
    step: 6,
    title: "Delivery",
    description: "Complete working system handover with source code, hardware schematics, and walkthrough.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
  topic?: string;
}

export const faqs: FAQItem[] = [
  {
    question: "How do I submit my project requirements to Nexora?",
    topic: "Getting Started",
    answer:
      "Fill out our request form with your project domain, abstract, target hardware or software stack, and deadline.",
  },
  {
    question: "What happens during the initial technical review?",
    topic: "Getting Started",
    answer:
      "Our engineers analyze component requirements, circuit or software architecture, and return actionable feasibility feedback within 24 to 48 hours.",
  },
  {
    question: "Can Nexora assist with both hardware prototypes and software?",
    topic: "Services & Engineering",
    answer:
      "Yes, we build end-to-end solutions spanning embedded microcontroller firmware, custom PCBs, FPGA logic, and full-stack web applications.",
  },
  {
    question: "What components and microcontrollers do you typically support?",
    topic: "Services & Engineering",
    answer:
      "We routinely work with ESP32, STM32, Arduino, Raspberry Pi Pico, various sensor modules, wireless transceivers (LoRa, BLE, Zigbee), and Xilinx/Altera FPGAs.",
  },
  {
    question: "Can Nexora assist with university capstone and final-year projects?",
    topic: "Services & Engineering",
    answer:
      "Yes, we mentor students through every stage of capstone execution, including hardware debugging, thesis report structuring, and viva defense preparation.",
  },
  {
    question: "How are project milestones and payments handled?",
    topic: "Process & Milestones",
    answer:
      "Every project is structured into clear phases—from initial schematic/architecture review to prototype demo and final delivery—with milestone-based quotes.",
  },
  {
    question: "How can I track progress during project development?",
    topic: "Process & Milestones",
    answer:
      "You receive continuous milestone updates, video demos of circuit breadboard testing, and direct chat communication with your assigned student builder.",
  },
  {
    question: "What support is provided upon final project delivery?",
    topic: "Delivery & Support",
    answer:
      "You receive complete source code, wiring schematics, setup instructions, and an interactive walkthrough session to ensure complete understanding.",
  },
];

export interface SiteStats {
  projectCount: number;
  serviceAreasCount: number;
}

export const stats: SiteStats = {
  get projectCount() {
    return projects?.length ?? 12;
  },
  get serviceAreasCount() {
    return services?.length ?? 4;
  },
};

export const steps = [
  {
    title: "Tell us your idea",
    text: "Share what you need, your goals, and your deadline. We’ll take it from there.",
    label: "Request",
  },
  {
    title: "Meet your project partner",
    text: "Get matched with the right team member for your project.",
    label: "Get assigned",
  },
  {
    title: "Bring it to life",
    text: "Work together, learn along the way, and get a project you’re proud of.",
    label: "Get your project",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  skills: string[];
  photo?: string;
}

export const team: TeamMember[] = [
  {
    name: "Arjun Kumar",
    role: "Hardware & Embedded Lead",
    skills: ["Circuit design", "Arduino", "ESP32"],
    photo: "/images/team/arjun-kumar.webp",
  },
  {
    name: "Priya Sharma",
    role: "Front-End Developer",
    skills: ["React", "TypeScript", "UI/UX"],
    photo: "/images/team/priya-sharma.webp",
  },
  {
    name: "Rahul Verma",
    role: "Embedded Developer & Student Mentor",
    skills: ["C/C++", "IoT", "Mentoring"],
    photo: "/images/team/rahul-verma.webp",
  },
];
