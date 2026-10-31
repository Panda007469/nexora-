export const categories = ["All projects", "Hardware", "Embedded Systems", "Front-End"] as const;

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  tech: string[];
  image: string;
  alt: string;
  width: number;
  height: number;
  summary: string;
  demoUrl: string;
  githubUrl: string;
  gallery: string[];
  published?: boolean;
}

interface RawProject {
  title: string;
  category: string;
  tech: string[];
  image: string;
  alt: string;
  width?: number;
  height?: number;
  summary?: string;
  published?: boolean;
}

const rawProjects: RawProject[] = [
  {
    title: "Smart Home Automation",
    category: "Hardware",
    tech: ["ESP32", "IoT", "C++"],
    image: "/images/project-smart-home.webp",
    alt: "Smart Home Automation circuit board and IoT relay controller",
    width: 1672,
    height: 941,
    published: true,
    summary:
      "A connected home, controlled from anywhere. An ESP32-powered prototype for lights, sensors, and everyday automation.",
  },
  {
    title: "Autonomous Obstacle-Avoiding Robot",
    category: "Embedded Systems",
    tech: ["Arduino", "Sensors", "C++"],
    image: "/images/project-obstacle-robot.webp",
    alt: "Autonomous obstacle-avoiding robotic rover with ultrasonic sensor",
    width: 1672,
    height: 941,
    published: true,
    summary:
      "An independent rover that senses its surroundings and finds a clear path using ultrasonic distance measurements.",
  },
  {
    title: "Student Productivity Dashboard",
    category: "Front-End",
    tech: ["React", "Tailwind CSS", "TypeScript"],
    image: "/images/project-productivity-dashboard.webp",
    alt: "Student productivity and task management web dashboard UI",
    width: 1672,
    height: 941,
    published: true,
    summary:
      "A focused workspace for students to organize projects, keep track of tasks, and make room for what matters.",
  },
  {
    title: "IoT Weather Station",
    category: "Embedded Systems",
    tech: ["ESP32", "DHT22", "MQTT"],
    image: "/images/project-weather-station.webp",
    alt: "IoT weather telemetry station prototype with sensors and microcontroller",
    width: 1672,
    height: 941,
    published: true,
  },
  {
    title: "Digital Attendance System",
    category: "Hardware",
    tech: ["RFID", "Arduino", "LCD"],
    image: "/images/project-attendance-system.webp",
    alt: "Digital RFID attendance logging system workbench prototype",
    width: 1536,
    height: 1024,
    published: true,
  },
  {
    title: "Creative Portfolio Website",
    category: "Front-End",
    tech: ["React", "CSS", "Vite"],
    image: "/images/project-portfolio-website.webp",
    alt: "Creative web portfolio design concept screenshot",
    width: 1672,
    height: 941,
    published: true,
  },
  {
    title: "Smart Irrigation Controller",
    category: "Embedded Systems",
    tech: ["ESP32", "Sensors", "C++"],
    image: "/images/project-irrigation.webp",
    alt: "Smart automated irrigation controller with soil moisture probe",
    width: 1672,
    height: 941,
    published: true,
  },
  {
    title: "Bluetooth-Controlled Rover",
    category: "Hardware",
    tech: ["Arduino", "Bluetooth", "Motors"],
    image: "/images/project-rover.webp",
    alt: "Bluetooth-controlled RC chassis rover prototype",
    width: 1672,
    height: 941,
    published: false,
  },
  {
    title: "Campus Events Platform",
    category: "Front-End",
    tech: ["React", "Tailwind CSS"],
    image: "/images/project-campus-events.webp",
    alt: "Campus student event discovery and ticketing platform UI",
    width: 1672,
    height: 941,
    published: false,
  },
  {
    title: "Air Quality Monitor",
    category: "Embedded Systems",
    tech: ["ESP32", "MQ135", "OLED"],
    image: "/images/project-air-quality.webp",
    alt: "Air quality particulate sensor workbench prototype",
    width: 1672,
    height: 941,
    published: false,
  },
  {
    title: "Solar Power Tracker",
    category: "Hardware",
    tech: ["Arduino", "LDR", "Servo"],
    image: "/images/project-solar-tracker.webp",
    alt: "Dual-axis solar tracking panel with servos and light sensors",
    width: 1672,
    height: 941,
    published: false,
  },
  {
    title: "Learning Resource Hub",
    category: "Front-End",
    tech: ["React", "TypeScript"],
    image: "/images/project-learning-hub.webp",
    alt: "Educational digital study material repository and learning hub UI",
    width: 1672,
    height: 941,
    published: false,
  },
];

export const projects: ProjectItem[] = rawProjects.map((project, index) => ({
  ...project,
  id: String(index + 1),
  slug: project.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
  width: project.width ?? 1672,
  height: project.height ?? 941,
  summary:
    project.summary ??
    "A hands-on student concept exploring thoughtful engineering, practical problem-solving, and accessible technology.",
  demoUrl: "https://example.com",
  githubUrl: "https://github.com",
  gallery: [project.image],
  published: project.published ?? false,
}));
