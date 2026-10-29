import { images } from "./images";
export const categories = ["All projects", "Hardware", "Embedded Systems", "Front-End"] as const;
export const projects = [
  {
    title: "Smart Home Automation",
    category: "Hardware",
    tech: ["ESP32", "IoT", "C++"],
    image: images.hero,
    summary:
      "A connected home, controlled from anywhere. An ESP32-powered prototype for lights, sensors, and everyday automation.",
  },
  {
    title: "Autonomous Obstacle-Avoiding Robot",
    category: "Embedded Systems",
    tech: ["Arduino", "Sensors", "C++"],
    image: images.robot,
    summary:
      "An independent rover that senses its surroundings and finds a clear path using ultrasonic distance measurements.",
  },
  {
    title: "Student Productivity Dashboard",
    category: "Front-End",
    tech: ["React", "Tailwind CSS", "TypeScript"],
    image: images.frontend,
    summary:
      "A focused workspace for students to organize projects, keep track of tasks, and make room for what matters.",
  },
  {
    title: "IoT Weather Station",
    category: "Embedded Systems",
    tech: ["ESP32", "DHT22", "MQTT"],
    image: images.hero,
  },
  {
    title: "Digital Attendance System",
    category: "Hardware",
    tech: ["RFID", "Arduino", "LCD"],
    image: images.robot,
  },
  {
    title: "Creative Portfolio Website",
    category: "Front-End",
    tech: ["React", "CSS", "Vite"],
    image: images.frontend,
  },
  {
    title: "Smart Irrigation Controller",
    category: "Embedded Systems",
    tech: ["ESP32", "Sensors", "C++"],
    image: images.hero,
  },
  {
    title: "Bluetooth-Controlled Rover",
    category: "Hardware",
    tech: ["Arduino", "Bluetooth", "Motors"],
    image: images.robot,
  },
  {
    title: "Campus Events Platform",
    category: "Front-End",
    tech: ["React", "Tailwind CSS"],
    image: images.frontend,
  },
  {
    title: "Air Quality Monitor",
    category: "Embedded Systems",
    tech: ["ESP32", "MQ135", "OLED"],
    image: images.hero,
  },
  {
    title: "Solar Power Tracker",
    category: "Hardware",
    tech: ["Arduino", "LDR", "Servo"],
    image: images.robot,
  },
  {
    title: "Learning Resource Hub",
    category: "Front-End",
    tech: ["React", "TypeScript"],
    image: images.frontend,
  },
].map((project, index) => ({
  ...project,
  id: String(index + 1),
  slug: project.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
  summary:
    project.summary ??
    "A hands-on student concept exploring thoughtful engineering, practical problem-solving, and accessible technology.",
  demoUrl: "https://example.com",
  githubUrl: "https://github.com",
  gallery: [project.image, project.category === "Front-End" ? images.hero : images.robot],
}));
