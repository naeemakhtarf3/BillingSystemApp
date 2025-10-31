import { create } from 'twrnc';

// Tailwind helper with custom color tokens used across screens
const tw = create({
  theme: {
    extend: {
      colors: {
        primary: '#2b6cb0',
        'background-light': '#f7f9fc',
        'background-dark': '#0b0f14',
        'text-light': '#0b1b2b',
        'text-dark': '#e6eef7',
        'border-light': '#d6dee6',
        'border-dark': '#22303d',
        'surface-light': '#ffffff',
        'surface-dark': '#121922',
      },
    },
  },
});

export default tw;


