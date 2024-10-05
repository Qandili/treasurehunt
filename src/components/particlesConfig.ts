// src/config/particlesConfig.ts
import type { Engine, ISourceOptions } from "tsparticles-engine";
import { loadFull } from "tsparticles";

export const particlesConfig: ISourceOptions = {
  background: {
    color: {
      value: "#0f172a", // Dark navy blue background
    },
  },
  fpsLimit: 60,
  interactivity: {
    detectsOn: "canvas",
    events: {
      onHover: {
        enable: false,
        mode: "repulse",
      },
      onClick: {
        enable: false,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
      push: {
        quantity: 4,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff", // White particles
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.1,
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: false,
      speed: 0.2, // Slow movement for the web
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 50, // Number of particles
    },
    opacity: {
      value: 0.2,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
  emitters: {
    direction: "none",
    position: {
      x: 50, // Center horizontally
      y: 50, // Center vertically
    },
    rate: {
      quantity: 1,
      delay: 2, // Emit a particle every 2 seconds
    },
    size: {
      width: 0,
      height: 0,
    },
    particles: {
      color: {
        value: "#10b981", // Light green color for the light effect
      },
      move: {
        speed: 2,
        direction: "none",
        outModes: {
          default: "destroy",
        },
        straight: true,
        path: {
          enable: true,
          delay: 0,
          generator: {
            type: "circle",
            options: {
              center: {
                x: 50,
                y: 50,
              },
              radius: 100,
            },
          },
        },
      },
      number: {
        value: 1,
      },
      opacity: {
        value: 1,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 4, max: 6 },
      },
      life: {
        duration: {
          sync: true,
          value: 3,
        },
        count: 0,
      },
      twinkle: {
        enable: true,
        frequency: 0.05,
        opacity: 1,
      },
    },
  },
};
