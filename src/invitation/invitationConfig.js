// ============================================================
// INVITATION CONFIGURATION
// Edit this file to personalize the experience.
// All text, colors, and options are centralized here.
// ============================================================

export const invitationConfig = {
  // Recipient & sender names
  recipientName: 'You',
  senderName: 'Me',

  // Scene 1 — Intro
  intro: {
    greeting: 'Hey...',
    teaser: 'I made something for you.',
    buttonLabel: 'Open it',
  },

  // Scene 2 — Heart message (shown after heart forms)
  heartMessage: {
    line1: 'Some things are easier to create than to say.',
    line2: 'So... I made this.',
    continueLabel: 'Continue',
  },

  // Scene 3 — Personal message lines (each shown one at a time)
  personalMessages: [
    'I know things have changed.',
    'I know you might say no.',
    "I'm not here to pressure you.",
    'I just wanted to ask one simple thing.',
    'Would you meet me once?',
  ],

  // Scene 4 — The invitation card
  invitation: {
    heading: 'One coffee?',
    subtext: [
      'No expectations.',
      'No pressure.',
      'Just a casual conversation.',
    ],
    yesLabel: "☕ Yes, let's meet",
    maybeLabel: '🌿 Maybe / Not right now',
  },

  // Scene 5 — Meeting form (she fills in date / time / place)
  meetingForm: {
    heading: "Let's make it official.",
    subheading: "You pick. I'll be there.",
    datePlaceholder: 'Choose a date',
    timePlaceholder: 'Choose a time',
    placePlaceholder: 'Where? (café, park, anywhere…)',
    notePlaceholder: 'Any special requests? (optional)',
    submitLabel: "Confirm ✓",
    submittingLabel: "Sending...",
    successHeading: "Waiting to see you. ❤️",
    successBody: "Thank you for giving this a chance. It means everything to me.",
  },

  // MAYBE / NO flow
  respectfulEnd: {
    line1: "That's okay.",
    line2: "You don't have to decide right now.",
    line3: "If you ever feel comfortable, you can let me know.",
    closing: 'Take care. 🌿',
  },

  // ============================================================
  // EmailJS Configuration
  // Get your free credentials at https://www.emailjs.com/
  //
  // SETUP STEPS:
  //  1. Sign up at emailjs.com (free)
  //  2. Add an Email Service (Gmail recommended)
  //  3. Create an Email Template with these variables:
  //       {{meeting_date}}, {{meeting_time}}, {{meeting_place}}, {{note}}
  //  4. Copy your Service ID, Template ID, and Public Key below
  // ============================================================
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',       // e.g. 'service_abc123'
    templateId: 'YOUR_TEMPLATE_ID',     // e.g. 'template_xyz456'
    publicKey: 'YOUR_PUBLIC_KEY',       // e.g. 'abcDEFghiJKLmno'
    toEmail: 'YOUR_EMAIL@gmail.com',    // your personal email address
  },

  // Theme overrides (optional — falls back to CSS variables)
  theme: {
    background: '#050609',
    accentPink: '#ffb6c1',
    accentRose: '#e8849a',
    textPrimary: '#f0f2f8',
    textSecondary: '#94a3b8',
  },
};
