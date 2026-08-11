// Scene state machine for the invitation experience
// Each state maps to a distinct visual scene.
export const SCENES = {
  START: 'START',
  INTRO: 'INTRO',
  MESSAGE: 'MESSAGE',
  INVITATION: 'INVITATION',
  MEETING_FORM: 'MEETING_FORM',        // She fills in date / time / place
  CONFIRMATION: 'CONFIRMATION',
  RESPECTFUL_END: 'RESPECTFUL_END',
};
