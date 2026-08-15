import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Audio,
  staticFile,
  Img,
} from 'remotion';

export interface ScholarshipProps {
  title: string;
  provider: string;
  amount_annual: string | number;
  amount_description: string;
  income_limit: string | number;
  min_marks: string | number;
  deadline: string;
  docs_needed: string[];
  apply_url: string;
  caste: string;
  gender: string;
  course_stream: string;
  renewal: string;
}

export const defaultProps: ScholarshipProps = {
  title: "NSP Post Matric Scholarship for Minorities",
  provider: "Ministry of Minority Affairs, Govt of India",
  amount_annual: 15000,
  amount_description: "Up to ₹15,000 per year towards admission & tuition fees.",
  income_limit: "2.0 Lakhs",
  min_marks: "50%",
  deadline: "31st December 2026",
  docs_needed: [
    "Income Certificate",
    "Marks Card of previous class",
    "Aadhaar Card",
    "Community/Caste Certificate"
  ],
  apply_url: "scholarships.gov.in",
  caste: "Minority Communities",
  gender: "All Genders",
  course_stream: "Classes 11, 12, UG, PG, and Technical courses",
  renewal: "Must pass the previous class with 50% marks to renew."
};

// Helper Component: Staggered Word Reveal Kinetic Typography
export const StaggeredTitle: React.FC<{
  text: string;
  style?: React.CSSProperties;
  colorWordIndex?: number; // Index of the word to highlight
  highlightColor?: string;
  startFrame?: number;
}> = ({ text, style, colorWordIndex = -1, highlightColor = '#3b82f6', startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <h1 style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: 'x', rowGap: '8px', margin: 0 }}>
      {words.map((word, idx) => {
        const wordFrame = frame - startFrame - idx * 4; // 4 frames delay per word
        const spr = spring({
          frame: wordFrame,
          fps,
          config: { damping: 12, stiffness: 120 },
        });

        const translateY = interpolate(spr, [0, 1], [30, 0]);
        const opacity = spr;
        const scale = interpolate(spr, [0, 1], [0.85, 1]);

        const isHighlighted = idx === colorWordIndex || (colorWordIndex === -2 && idx === words.length - 1);

        return (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              color: isHighlighted ? highlightColor : 'inherit',
              marginRight: '14px',
            }}
          >
            {word}
          </span>
        );
      })}
    </h1>
  );
};

// Helper Component: Deterministic Confetti Emitter
export const ConfettiParticles: React.FC<{
  count?: number;
  startFrame?: number;
}> = ({ count = 60, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const activeFrame = frame - startFrame;

  if (activeFrame < 0) return null;

  // Simple seed-based random generator (deterministic)
  const getRand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, idx) => {
        const seed = idx + 1;
        const angle = getRand(seed * 10) * 2 * Math.PI;
        const velocity = 8 + getRand(seed * 20) * 16;
        const gravity = 0.35;
        
        const time = activeFrame;
        const initialX = 540; // Center X
        const initialY = 800; // Center Y
        
        const dx = Math.cos(angle) * velocity * time;
        const dy = Math.sin(angle) * velocity * time + 0.5 * gravity * time * time;
        
        const x = initialX + dx;
        const y = initialY + dy;
        
        const rotation = getRand(seed * 30) * 360 + time * 6;
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
        const color = colors[Math.floor(getRand(seed * 40) * colors.length)];
        const size = 12 + getRand(seed * 50) * 18;
        const opacity = Math.max(0, 1 - time / 90);
        
        if (opacity <= 0 || x < 0 || x > 1080 || y > 1920) return null;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: getRand(seed * 60) > 0.55 ? '50%' : '4px',
              transform: `rotate(${rotation}deg)`,
              opacity,
              zIndex: 99,
            }}
          />
        );
      })}
    </div>
  );
};

export const ScholarshipShort: React.FC<ScholarshipProps> = ({
  title,
  provider,
  amount_annual,
  amount_description,
  income_limit,
  min_marks,
  deadline,
  docs_needed,
  apply_url,
  caste,
  gender,
  course_stream,
  renewal,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ambient glow moving or shifting hue over time for a vibrant, modern background
  const hue1 = interpolate(frame, [0, 450, 900], [210, 260, 210]); // Blue to Indigo glow
  const hue2 = interpolate(frame, [0, 450, 900], [280, 330, 280]); // Purple to Magenta glow

  const containerStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: '#030408',
    backgroundImage: `
      radial-gradient(circle at 80% 15%, HSL(${hue1}, 85%, 22%) 0%, transparent 60%),
      radial-gradient(circle at 15% 85%, HSL(${hue2}, 85%, 20%) 0%, transparent 70%),
      linear-gradient(180deg, #060814 0%, #020306 100%)
    `,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#ffffff',
    padding: '80px 60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  };

  // Top Progress Bar
  const progressStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '12px',
    backgroundColor: '#3b82f6',
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    width: `${(frame / 900) * 100}%`,
  };

  // Slides configuration (900 frames total = 30 seconds at 30 fps)
  // Intro: 0 to 150 (5s)
  // Eligibility: 150 to 390 (8s)
  // Benefits: 390 to 600 (7s)
  // Documents: 600 to 780 (6s)
  // Outro: 780 to 900 (4s)

  const showIntro = frame >= 0 && frame < 150;
  const showEligibility = frame >= 150 && frame < 390;
  const showBenefits = frame >= 390 && frame < 600;
  const showDocuments = frame >= 600 && frame < 780;
  const showOutro = frame >= 780 && frame <= 900;

  // Formatting amount
  const displayAmount = typeof amount_annual === 'number' 
    ? `₹${amount_annual.toLocaleString('en-IN')}` 
    : amount_annual;

  return (
    <div style={containerStyle}>
      <Audio src={staticFile("voiceover.m4a")} />
      <div style={progressStyle} />

      {/* Top Header - static across slides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Img 
            src={staticFile("logo-square.png")} 
            style={{ 
              height: '64px', 
              width: '64px', 
              borderRadius: '14px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)' 
            }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
              India Scholarships
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
              Alerts
            </span>
          </div>
        </div>
        <div style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* SLIDE 1: INTRO */}
      {showIntro && (
        <>
          <IntroSlide 
            frame={frame} 
            title={title} 
            provider={provider} 
            displayAmount={displayAmount}
            deadline={deadline}
            fps={fps} 
          />
          <ConfettiParticles startFrame={0} count={60} />
        </>
      )}

      {/* SLIDE 2: ELIGIBILITY */}
      {showEligibility && (
        <EligibilitySlide 
          frame={frame - 150} 
          income={income_limit} 
          marks={min_marks} 
          caste={caste}
          gender={gender}
          course_stream={course_stream}
          fps={fps} 
        />
      )}

      {/* SLIDE 3: BENEFITS */}
      {showBenefits && (
        <BenefitsSlide 
          frame={frame - 390} 
          displayAmount={displayAmount} 
          description={amount_description}
          renewal={renewal}
          fps={fps} 
        />
      )}

      {/* SLIDE 4: DOCUMENTS */}
      {showDocuments && (
        <DocumentsSlide 
          frame={frame - 600} 
          docs={docs_needed} 
          fps={fps} 
        />
      )}

      {/* SLIDE 5: OUTRO */}
      {showOutro && (
        <>
          <OutroSlide 
            frame={frame - 780} 
            applyUrl={apply_url} 
            fps={fps} 
          />
          <ConfettiParticles startFrame={780} count={80} />
        </>
      )}

      {/* Bottom watermark/footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        opacity: 0.8
      }}>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 600, 
          color: '#9ca3af',
          letterSpacing: '1.5px'
        }}>
          IndiaScholarships.in
        </div>
      </div>
    </div>
  );
};

// Component: Intro Slide
const IntroSlide: React.FC<{ 
  frame: number; 
  title: string; 
  provider: string; 
  displayAmount: string; 
  deadline: string;
  fps: number; 
}> = ({ frame, title, provider, displayAmount, deadline, fps }) => {
  const spr1 = spring({ frame, fps, config: { damping: 12 } });
  const spr2 = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const spr3 = spring({ frame: frame - 30, fps, config: { damping: 12 } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1, justifyContent: 'center' }}>
      <div style={{
        transform: `translateY(${interpolate(spr1, [0, 1], [40, 0])}px)`,
        opacity: spr1,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div>
          <span style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 800,
            padding: '10px 22px',
            borderRadius: '30px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
          }}>
            Scholarship Alert 🚨
          </span>
        </div>

        <StaggeredTitle 
          text={title} 
          startFrame={15} 
          style={{
            fontSize: '62px',
            fontWeight: 900,
            lineHeight: 1.2,
            color: '#ffffff',
            margin: '10px 0 0 0',
          }} 
        />

        <p style={{
          fontSize: '26px',
          color: '#a3a3a3',
          margin: 0,
          lineHeight: 1.3,
          fontWeight: 500,
        }}>
          By {provider}
        </p>
      </div>

      {/* Human Student Photo + Reward/Deadline Overlay Card */}
      <div style={{
        position: 'relative',
        borderRadius: '30px',
        overflow: 'hidden',
        height: '420px',
        width: '100%',
        border: '2px solid rgba(255, 255, 255, 0.12)',
        transform: `scale(${interpolate(spr3, [0, 1], [0.9, 1])})`,
        opacity: spr3,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
        <img 
          src={staticFile('student_happy.jpg')} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} 
        />
        
        {/* Transparent blur details overlay banner */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(0deg, rgba(3, 4, 8, 0.95) 0%, rgba(3, 4, 8, 0.5) 100%)',
          padding: '25px 35px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(6px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div>
            <div style={{ fontSize: '18px', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Reward Amount</div>
            <div style={{ fontSize: '50px', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>{displayAmount}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '16px', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '1px' }}>Apply Before</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{deadline}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component: Eligibility Slide
const EligibilitySlide: React.FC<{ 
  frame: number; 
  income: string | number; 
  marks: string | number; 
  caste: string;
  gender: string;
  course_stream: string;
  fps: number; 
}> = ({ frame, income, marks, caste, gender, course_stream, fps }) => {
  const sprTitle = spring({ frame, fps, config: { damping: 12 } });
  const sprCard1 = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const sprCard2 = spring({ frame: frame - 30, fps, config: { damping: 12 } });
  const sprCard3 = spring({ frame: frame - 45, fps, config: { damping: 12 } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1, justifyContent: 'center' }}>
      <div style={{
        transform: `translateY(${interpolate(sprTitle, [0, 1], [40, 0])}px)`,
        opacity: sprTitle,
      }}>
        <StaggeredTitle 
          text="Who is Eligible? Check Now! 👇" 
          colorWordIndex={2} 
          highlightColor="#8b5cf6" 
          style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '10px' }}>
        {/* Income Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(3, 4, 8, 0.5) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          padding: '30px 35px',
          transform: `translateX(${interpolate(sprCard1, [0, 1], [-100, 0])}px)`,
          opacity: sprCard1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '44px' }}>💰</span>
            <div>
              <div style={{ fontSize: '18px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Annual Family Income</div>
              <div style={{ fontSize: '38px', fontWeight: 800, marginTop: '2px' }}>Must be under ₹{income}</div>
            </div>
          </div>
        </div>

        {/* Marks Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(3, 4, 8, 0.5) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          padding: '30px 35px',
          transform: `translateX(${interpolate(sprCard2, [0, 1], [100, 0])}px)`,
          opacity: sprCard2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '44px' }}>🎯</span>
            <div>
              <div style={{ fontSize: '18px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Requirement</div>
              <div style={{ fontSize: '38px', fontWeight: 800, marginTop: '2px' }}>At least {marks} Marks</div>
            </div>
          </div>
        </div>

        {/* Category & Course Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(3, 4, 8, 0.5) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          padding: '30px 35px',
          transform: `translateX(${interpolate(sprCard3, [0, 1], [-100, 0])}px)`,
          opacity: sprCard3,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '44px' }}>🎓</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Target Group & Courses</div>
              <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '2px', color: '#ffffff' }}>
                {caste} | {gender}
              </div>
              <div style={{ fontSize: '20px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.3 }}>
                {course_stream}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component: Benefits Slide
const BenefitsSlide: React.FC<{ 
  frame: number; 
  displayAmount: string; 
  description: string;
  renewal: string;
  fps: number; 
}> = ({ frame, displayAmount, description, renewal, fps }) => {
  const spr1 = spring({ frame, fps, config: { damping: 12 } });
  const spr2 = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const spr3 = spring({ frame: frame - 30, fps, config: { damping: 12 } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1, justifyContent: 'center' }}>
      <div style={{
        transform: `translateY(${interpolate(spr1, [0, 1], [40, 0])}px)`,
        opacity: spr1,
      }}>
        <StaggeredTitle 
          text="Scholarship Benefits 🎁" 
          colorWordIndex={1} 
          highlightColor="#10b981" 
          style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '35px', marginTop: '20px' }}>
        {/* Main Reward Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(3, 4, 8, 0.6) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '30px',
          padding: '45px 50px',
          transform: `translateY(${interpolate(spr2, [0, 1], [60, 0])}px)`,
          opacity: spr2,
        }}>
          <div>
            <div style={{ fontSize: '24px', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Financial Award</div>
            <div style={{ fontSize: '96px', fontWeight: 900, color: '#10b981', marginTop: '10px', lineHeight: 1.0 }}>{displayAmount}</div>
            <div style={{ fontSize: '30px', color: '#a3a3a3', marginTop: '12px', fontWeight: 500 }}>Disbursed Annually directly to Bank Account</div>
          </div>

          {description && (
            <div style={{ 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              paddingTop: '25px', 
              marginTop: '25px',
              fontSize: '44px', 
              lineHeight: 1.5,
              fontWeight: 600,
              color: '#f3f4f6'
            }}>
              {description}
            </div>
          )}
        </div>

        {/* Renewal Conditions Card */}
        {renewal && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '30px',
            padding: '40px 50px',
            transform: `translateY(${interpolate(spr3, [0, 1], [60, 0])}px)`,
            opacity: spr3,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
              <span style={{ fontSize: '50px' }}>🔄</span>
              <div>
                <div style={{ fontSize: '24px', color: '#d1d5db', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Renewal Terms</div>
                <div style={{ fontSize: '38px', color: '#ffffff', marginTop: '8px', lineHeight: 1.5, fontWeight: 500 }}>
                  {renewal}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component: Documents Slide
const DocumentsSlide: React.FC<{ 
  frame: number; 
  docs: string[]; 
  fps: number; 
}> = ({ frame, docs, fps }) => {
  const sprTitle = spring({ frame, fps, config: { damping: 12 } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flex: 1, justifyContent: 'center' }}>
      <div style={{
        transform: `translateY(${interpolate(sprTitle, [0, 1], [30, 0])}px)`,
        opacity: sprTitle,
      }}>
        <StaggeredTitle 
          text="Required Documents 📂" 
          colorWordIndex={1} 
          highlightColor="#f59e0b" 
          style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff' }} 
        />
        <p style={{ fontSize: '26px', color: '#9ca3af', marginTop: '10px' }}>Keep these ready before you apply:</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
        {docs.slice(0, 4).map((doc, idx) => {
          const docSpr = spring({ frame: frame - 10 - idx * 10, fps, config: { damping: 14 } });
          return (
            <div 
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '35px 45px',
                fontSize: '44px',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transform: `translateX(${interpolate(docSpr, [0, 1], [-50, 0])}px)`,
                opacity: docSpr,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <span style={{ color: '#f59e0b', fontSize: '48px' }}>✔</span>
              <span>{doc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Component: Outro Slide
const OutroSlide: React.FC<{ 
  frame: number; 
  applyUrl: string; 
  fps: number; 
}> = ({ frame, applyUrl, fps }) => {
  const spr1 = spring({ frame, fps, config: { damping: 12 } });
  const spr2 = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const spr3 = spring({ frame: frame - 30, fps, config: { damping: 12 } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{
        transform: `scale(${interpolate(spr1, [0, 1], [0.8, 1])})`,
        opacity: spr1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <StaggeredTitle 
          text="Apply Online Now! 🚀" 
          colorWordIndex={1} 
          highlightColor="#3b82f6" 
          style={{ fontSize: '60px', fontWeight: 900, color: '#ffffff' }} 
        />
      </div>

      {/* Celebrating Student Image Card */}
      <div style={{
        position: 'relative',
        borderRadius: '30px',
        overflow: 'hidden',
        height: '350px',
        width: '100%',
        border: '2px solid rgba(59, 130, 246, 0.2)',
        transform: `translateY(${interpolate(spr2, [0, 1], [40, 0])}px)`,
        opacity: spr2,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>
        <img 
          src={staticFile('student_success.jpg')} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} 
        />
        
        {/* Banner overlay with trust badges */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(3, 4, 8, 0.85)',
          padding: '15px 30px',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          {["Verified Alerts", "Direct Links"].map((val, idx) => (
            <div key={idx} style={{ fontSize: '20px', color: '#a78bfa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981' }}>✔</span> {val}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        transform: `translateY(${interpolate(spr3, [0, 1], [50, 0])}px)`,
        opacity: spr3,
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '50px',
          padding: '25px 40px',
          fontSize: '44px',
          fontWeight: 900,
          boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
        }}>
          IndiaScholarships.in
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '25px 30px',
        }}>
          <div style={{ fontSize: '22px', color: '#a78bfa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
            Get Direct Official Application Link
          </div>
          <div style={{ fontSize: '26px', color: '#9ca3af', marginTop: '8px', lineHeight: 1.4 }}>
            Search this scholarship on our site to apply step-by-step
          </div>
        </div>
      </div>
    </div>
  );
};
