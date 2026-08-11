import React, { useState, useEffect, useRef, useCallback } from 'react';
import { invitationConfig } from './invitationConfig.js';
import { RainEffect } from './RainEffect.jsx';
import { FireworksEffect } from './FireworksEffect.jsx';
import './invitation.css';

// ─────────────────────────────────────────────────────────────────────────────
//  50 unique convincing messages — progressively funnier / more desperate
//  Each step: { emoji, heading, subtext[], yesLabel, noLabel }
//  All strings use double-quotes to avoid apostrophe issues.
// ─────────────────────────────────────────────────────────────────────────────
const NO_CONVERSATION = [
  // 1-10 : Surprised → Funny
  {
    emoji: "😮", heading: "Wait, really?",
    subtext: ["Even just 20 minutes?", "I promise I shower regularly."],
    yesLabel: "☕ Okay, fine", noLabel: "Still no 🙅",
  },
  {
    emoji: "🥺", heading: "Not even coffee?",
    subtext: ["I googled 'best coffee spots'.", "Took notes. Made a spreadsheet."],
    yesLabel: "😂 That effort deserves a yes", noLabel: "A spreadsheet and still no",
  },
  {
    emoji: "😅", heading: "A spreadsheet though...",
    subtext: ["I also practiced what to say.", "Three times. In front of a mirror."],
    yesLabel: "😭 Okay okay, YES", noLabel: "Mirror practice wasn't enough",
  },
  {
    emoji: "🤡", heading: "Mirror-practiced and rejected.",
    subtext: ["At this point I should win an award.", "Bravest clown of the year."],
    yesLabel: "🏆 Fine, you deserve it", noLabel: "Reject the clown",
  },
  {
    emoji: "🐾", heading: "My dog voted yes.",
    subtext: ["She has great taste.", "(She also eats socks, but still.)"],
    yesLabel: "🐶 The dog convinced me", noLabel: "Even the dog can't help",
  },
  {
    emoji: "🧠", heading: "Fun fact:",
    subtext: ["Saying yes burns 0 calories.", "Saying no burns 0 calories too.", "One is way more fun though."],
    yesLabel: "📊 The science checks out", noLabel: "Science is wrong",
  },
  {
    emoji: "🌮", heading: "Pizza is also on the table.",
    subtext: ["I'm flexible.", "Emotionally and geographically."],
    yesLabel: "🍕 Pizza? Now we're talking", noLabel: "Not even for pizza",
  },
  {
    emoji: "🎵", heading: "I wrote a song about this moment.",
    subtext: ["It has 3 verses.", "You haven't heard verse 3 yet.", "(It's the best one.)"],
    yesLabel: "🎶 I want to hear verse 3", noLabel: "Hard pass on verse 3",
  },
  {
    emoji: "🧁", heading: "I can bake.",
    subtext: ["Well, I've watched YouTube videos.", "That counts. Probably."],
    yesLabel: "🍰 I'll risk it", noLabel: "Not trusting that baking",
  },
  {
    emoji: "🏋️", heading: "I've been working out.",
    subtext: ["For 3 days.", "But still — effort."],
    yesLabel: "💪 3 days is inspiring", noLabel: "Need more than 3 days",
  },

  // 11-20 : More creative / absurd
  {
    emoji: "🌟", heading: "Statistically speaking…",
    subtext: ["People who say yes to coffee", "have 340% more fun.", "(I made that up. But still.)"],
    yesLabel: "📈 I want 340% more fun", noLabel: "Made-up stats aren't convincing",
  },
  {
    emoji: "🦋", heading: "Think of the butterfly effect.",
    subtext: ["One yes → coffee → good conversation", "→ universe is happy."],
    yesLabel: "🌍 For the universe", noLabel: "Universe can manage",
  },
  {
    emoji: "🎯", heading: "My horoscope said today was the day.",
    subtext: ["I don't believe in horoscopes.", "But I believed in this one."],
    yesLabel: "♓ The stars aligned, fine", noLabel: "Stars are wrong too",
  },
  {
    emoji: "🌺", heading: "I planted flowers for this moment.",
    subtext: ["They're fake flowers.", "But the feelings are real."],
    yesLabel: "🌸 Fake flowers, real vibes", noLabel: "Fake flowers. No.",
  },
  {
    emoji: "📱", heading: "I even cleaned my phone screen.",
    subtext: ["For the selfie.", "That we might take.", "Together."],
    yesLabel: "🤳 Clean screen, let's go", noLabel: "Screen cleaned for nothing",
  },
  {
    emoji: "🧩", heading: "You're the missing piece.",
    subtext: ["Of my Saturday afternoon.", "Specifically 3pm–5pm."],
    yesLabel: "🕒 I can do 3pm", noLabel: "Saturdays are sacred",
  },
  {
    emoji: "😭", heading: "My pillow has heard more of this speech than you.",
    subtext: ["It's very supportive.", "But it's a pillow."],
    yesLabel: "🛏️ Better than a pillow, fine", noLabel: "The pillow is enough",
  },
  {
    emoji: "🎪", heading: "I googled how to be charming.",
    subtext: ["Got 2.3 million results.", "Read 3 of them."],
    yesLabel: "✨ I can see you tried", noLabel: "Needed to read more",
  },
  {
    emoji: "🦄", heading: "A unicorn appeared in my dream.",
    subtext: ["It said 'just say yes'.", "I'm just the messenger."],
    yesLabel: "🦄 Can't argue with unicorns", noLabel: "Dreams lie",
  },
  {
    emoji: "🎲", heading: "Let's flip a coin.",
    subtext: ["Heads = coffee.", "Tails = coffee.", "It's a rigged coin. Worth it."],
    yesLabel: "🪙 Rigged but fair", noLabel: "Not playing rigged games",
  },

  // 21-30 : Deeply chaotic energy
  {
    emoji: "🌈", heading: "Every time someone says no to coffee,",
    subtext: ["a rainbow loses a color.", "Think of the rainbows."],
    yesLabel: "🌈 For the rainbows!", noLabel: "Rainbows don't need me",
  },
  {
    emoji: "🐸", heading: "My frog Gerald thinks you should say yes.",
    subtext: ["His name is Gerald.", "Gerald is wise."],
    yesLabel: "🐸 Gerald's word is law", noLabel: "I don't trust Gerald",
  },
  {
    emoji: "🏖️", heading: "We don't even have to do coffee.",
    subtext: ["Walk, talk, sit, stand.", "I'm very low-maintenance."],
    yesLabel: "🚶 A walk sounds good", noLabel: "Even a walk is too much",
  },
  {
    emoji: "🎭", heading: "I've been dramatically sighing for 3 days.",
    subtext: ["My neighbors are concerned.", "Help them. Help me. Say yes."],
    yesLabel: "🏘️ Saving the neighborhood", noLabel: "Neighbors will survive",
  },
  {
    emoji: "🌙", heading: "Even the moon is rooting for us.",
    subtext: ["It's full tonight.", "Very romantic moon."],
    yesLabel: "🌕 The moon knows", noLabel: "The moon is biased",
  },
  {
    emoji: "🧸", heading: "My childhood teddy bear approves.",
    subtext: ["He's seen a lot.", "This passes his vibe check."],
    yesLabel: "🧸 Teddy approval matters", noLabel: "Teddy is too lenient",
  },
  {
    emoji: "🎨", heading: "I made a vision board.",
    subtext: ["It has exactly one item on it.", "You can guess what it is."],
    yesLabel: "🖼️ I'm on a vision board??", noLabel: "Vision boards are cringe",
  },
  {
    emoji: "⏰", heading: "Every second you say no,",
    subtext: ["I age slightly.", "Think of my skin."],
    yesLabel: "✨ Fine, for your skin", noLabel: "Aging is natural",
  },
  {
    emoji: "🌻", heading: "Sunflowers grow toward the sun.",
    subtext: ["I grow toward your general direction.", "It's basically the same."],
    yesLabel: "☀️ That's oddly sweet", noLabel: "That's oddly creepy",
  },
  {
    emoji: "🦊", heading: "A fox told me to be bold.",
    subtext: ["I don't have a fox.", "But the energy was there."],
    yesLabel: "🦊 Bold energy appreciated", noLabel: "Foxless argument, no",
  },

  // 31-40 : Soft desperation → wholesome
  {
    emoji: "🎵", heading: "I have a playlist ready.",
    subtext: ["27 songs.", "Song 14 is embarrassingly optimistic."],
    yesLabel: "🎧 I want to hear song 14", noLabel: "Keep your playlist",
  },
  {
    emoji: "📚", heading: "I've read 3 books on making good impressions.",
    subtext: ["I remember none of it.", "But effort counts."],
    yesLabel: "📖 Effort absolutely counts", noLabel: "Read more books",
  },
  {
    emoji: "🍦", heading: "Ice cream is also available.",
    subtext: ["As a bribe.", "I'm not above bribery."],
    yesLabel: "🍨 Bribed. Worth it.", noLabel: "Not bribable. Sadly.",
  },
  {
    emoji: "🌊", heading: "Imagine a calm ocean.",
    subtext: ["That's how peaceful coffee with me would be.", "Mostly."],
    yesLabel: "🌊 Mostly calm sounds fine", noLabel: '"Mostly" is concerning',
  },
  {
    emoji: "😂", heading: "I'm actually very funny in person.",
    subtext: ["...According to my mom.", "She's unbiased."],
    yesLabel: "😂 Moms don't lie", noLabel: "Moms always lie",
  },
  {
    emoji: "🐬", heading: "Dolphins also approve.",
    subtext: ["I surveyed them.", "They clicked in agreement."],
    yesLabel: "🐬 Dolphin-approved ✓", noLabel: "You faked that survey",
  },
  {
    emoji: "🧊", heading: "I'm cool under pressure.",
    subtext: ["Not literally — it's quite warm.", "But emotionally. Very cool."],
    yesLabel: "😎 Emotional coolness noted", noLabel: "No thanks, cool person",
  },
  {
    emoji: "🌸", heading: "Spring exists because people said yes.",
    subtext: ["To flowers. To sunshine.", "To coffee dates."],
    yesLabel: "🌷 I'm doing this for spring", noLabel: "Autumn is fine too",
  },
  {
    emoji: "🦋", heading: "I pinky-promised my future self we'd try.",
    subtext: ["He's very disappointed right now.", "Future me sends his regards."],
    yesLabel: "🤝 Honor the pinky promise", noLabel: "Future you will cope",
  },
  {
    emoji: "🏆", heading: "You'd be helping me win a bet.",
    subtext: ["I bet myself I'd ask.", "Technically I already won.", "But still."],
    yesLabel: "🎖️ Happy to help you win", noLabel: "Already won, walk away",
  },

  // 41-50 : Final desperate stretch → sincere ending
  {
    emoji: "🌺", heading: "I have a reservation.",
    subtext: ["I don't. But I'll make one.", "In 4 minutes. Watch."],
    yesLabel: "⏱️ Okay, make the reservation", noLabel: "4 minutes wasted",
  },
  {
    emoji: "😌", heading: "Okay, final offer:",
    subtext: ["Just one hour.", "If it's terrible, I'll drive you home.", "Deal?"],
    yesLabel: "🤝 One hour. Deal.", noLabel: "I'll walk home, thanks",
  },
  {
    emoji: "🙈", heading: "Okay I lied, that wasn't final.",
    subtext: ["Here's another attempt.", "I made memes about this situation.", "(They're funny. Trust me.)"],
    yesLabel: "😂 Show me the memes", noLabel: "Memes won't save you",
  },
  {
    emoji: "🫠", heading: "I'm melting here.",
    subtext: ["Metaphorically.", "Emotionally.", "Also maybe literally. It's hot."],
    yesLabel: "🫙 Please stop melting", noLabel: "Melt on",
  },
  {
    emoji: "🤖", heading: "I asked AI for advice.",
    subtext: ["It said 'just be yourself'.", "I'm doing that right now.", "(This IS myself.)"],
    yesLabel: "🤖 AI approved this", noLabel: "AI was wrong",
  },
  {
    emoji: "🌍", heading: "I'll donate to charity if you say yes.",
    subtext: ["Any charity.", "Your choice.", "I'm that committed."],
    yesLabel: "💝 For charity — YES", noLabel: "No charity is worth this",
  },
  {
    emoji: "🎠", heading: "Okay, I've run out of ideas.",
    subtext: ["I've used 47 of them.", "You've rejected all 47.", "Impressive honestly."],
    yesLabel: "😭 Fine, just to end this", noLabel: "Reject #48 coming right up",
  },
  {
    emoji: "😔", heading: "I'll accept the L gracefully.",
    subtext: ["Just kidding — one more try.", "(I'm not graceful at this.)"],
    yesLabel: "😂 I respect the persistence", noLabel: "Grace is overrated",
  },
  {
    emoji: "🤍", heading: "Last attempt. For real this time.",
    subtext: ["I just think we'd have a good time.", "That's it.", "That's the whole pitch."],
    yesLabel: "🤍 Okay. Yes.", noLabel: "I've made my decision",
  },
  {
    emoji: "🥹", heading: "50 attempts and still here.",
    subtext: ["I think that says something.", "Even if the answer is no.", "...One last coffee though?"],
    yesLabel: "☕ ...Fine. Yes. Coffee.", noLabel: "Truly no. I'm sorry.",
  },
];

const TOTAL_STEPS = NO_CONVERSATION.length; // 50

export function InvitationCard({ onYes, onMaybe }) {
  const [visible, setVisible] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [rainActive, setRainActive] = useState(false);
  const { invitation } = invitationConfig;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleNo = useCallback(() => {
    // Start / intensify rain on every No click
    setRainActive(true);

    if (noCount >= TOTAL_STEPS) {
      onMaybe();
      return;
    }

    setShake(true);
    setTransitioning(true);
    setTimeout(() => {
      setShake(false);
      setNoCount(c => c + 1);
      setTransitioning(false);
    }, 380);
  }, [noCount, onMaybe]);

  const handleYes = useCallback(() => {
    setRainActive(false);
    setShowFireworks(true);
    // Play fireworks for 5 seconds before going to the form
    setTimeout(() => { onYes(); }, 5000);
  }, [onYes]);

  const currentStep = noCount > 0
    ? NO_CONVERSATION[Math.min(noCount - 1, TOTAL_STEPS - 1)]
    : null;

  const heading  = currentStep ? currentStep.heading  : invitation.heading;
  const subtext  = currentStep ? currentStep.subtext  : invitation.subtext;
  const emoji    = currentStep ? currentStep.emoji    : null;
  const yesLabel = currentStep ? currentStep.yesLabel : invitation.yesLabel;
  const noLabel  = noCount >= TOTAL_STEPS
    ? "😔 Okay, I get it."
    : (currentStep ? currentStep.noLabel : invitation.maybeLabel);

  // First 10 nos → show dots; 11+ → show compact counter
  const showDots  = noCount > 0 && noCount <= 10;
  const showCount = noCount > 10;

  return (
    <>
      {/* Rain — starts after first No, intensifies each time */}
      {rainActive && <RainEffect intensity={noCount} active={rainActive} />}

      {/* Fireworks — launched when YES is clicked */}
      {showFireworks && <FireworksEffect onDone={() => setShowFireworks(false)} />}

      <div className="inv-scene inv-scene--invitation" aria-label="Invitation">
        <div
          className={[
            "inv-card",
            visible       ? "inv-card--visible"      : "",
            shake         ? "inv-card--shake"         : "",
            transitioning ? "inv-card--transitioning" : "",
          ].join(" ")}
        >
          <div className="inv-card-inner">

            {emoji && (
              <div className="inv-card-emoji" key={`emoji-${noCount}`} aria-hidden="true">
                {emoji}
              </div>
            )}

            <h1 className="inv-card-heading inv-card-heading--animated" key={`h-${noCount}`}>
              {heading}
            </h1>

            <div className="inv-card-subtext" key={`sub-${noCount}`}>
              {subtext.map((line, i) => (
                <p
                  key={i}
                  className="inv-card-subline inv-card-subline--animated"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Progress: dots for first 10, counter after that */}
            {showDots && (
              <div className="inv-no-progress" aria-label={`Attempt ${noCount} of ${TOTAL_STEPS}`}>
                {Array.from({ length: Math.min(noCount + 2, 10) }).map((_, i) => (
                  <span key={i} className={`inv-no-dot ${i < noCount ? "inv-no-dot--filled" : ""}`} />
                ))}
                {noCount >= 8 && <span className="inv-no-more">…</span>}
              </div>
            )}
            {showCount && (
              <div className="inv-no-counter" aria-label={`Attempt ${noCount}`}>
                <span className="inv-no-counter-num" key={noCount}>#{noCount}</span>
                <span className="inv-no-counter-label"> attempt</span>
              </div>
            )}

            <div className="inv-card-actions">
              <button
                className="inv-btn inv-btn--yes"
                onClick={handleYes}
                aria-label={yesLabel}
              >
                <span className="inv-btn-ripple" aria-hidden="true" />
                {yesLabel}
              </button>

              <button
                className={`inv-btn inv-btn--maybe ${noCount >= TOTAL_STEPS ? "inv-btn--maybe-final" : ""}`}
                onClick={handleNo}
                aria-label={noLabel}
              >
                {noLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
