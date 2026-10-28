import hero from "@/assets/nexora-hero.jpg";
import robot from "@/assets/embedded.jpg";
import frontend from "@/assets/frontend.jpg";
import teamImage from "@/assets/team.jpg";
export const images = { hero, robot, frontend, team: teamImage };
export const navigation = [
  { name: "Home", to: "/" },
  { name: "Services", to: "/services" },
  { name: "Projects", to: "/projects" },
  { name: "About", to: "/about" },
] as const;
export const services = [
  {
    id: "hardware",
    name: "Hardware Projects",
    short: "From an idea to a working prototype.",
    description:
      "Circuit design, prototyping, and hands-on builds that bring your ideas into the real world.",
    icon: "hardware",
    tags: ["Circuit design", "PCB & prototyping"],
  },
  {
    id: "embedded",
    name: "Embedded Systems",
    short: "Small boards. Big possibilities.",
    description:
      "Smart, connected systems built with microcontrollers, sensors, and thoughtfully written firmware.",
    icon: "embedded",
    tags: ["Arduino & ESP32", "IoT solutions"],
  },
  {
    id: "frontend",
    name: "Front-End Development",
    short: "Interfaces people love to use.",
    description:
      "Clean, responsive websites and web applications that look great and work beautifully.",
    icon: "frontend",
    tags: ["React & Tailwind", "Responsive websites"],
  },
  {
    id: "advice",
    name: "Student Advice",
    short: "A little direction goes a long way.",
    description:
      "Friendly, practical guidance on project ideas, technical roadblocks, and your next steps.",
    icon: "advice",
    tags: ["Project guidance", "1-on-1 support"],
  },
];
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
export const team = [
  {
    name: "Arjun Kumar",
    role: "Hardware & Embedded Lead",
    skills: ["Circuit design", "Arduino", "ESP32"],
    photo: 0,
  },
  {
    name: "Priya Sharma",
    role: "Front-End Developer",
    skills: ["React", "TypeScript", "UI/UX"],
    photo: 1,
  },
  {
    name: "Rahul Verma",
    role: "Embedded Developer & Student Mentor",
    skills: ["C/C++", "IoT", "Mentoring"],
    photo: 2,
  },
];
