import './Logo.scss';

interface LogoProps {
  size?: 'sm' | 'lg';
}

export function Logo({ size = 'sm' }: LogoProps) {
  return (
    <div className={`logo logo--${size}`}>
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="100%" height="100%">
          <path d="M9 11.5h14M9 16h9M9 20.5h5.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="23" cy="20.5" r="2.2" fill="white" />
        </svg>
      </span>
      <span className="logo__text">
        Lingua<span className="logo__ai">AI</span>
      </span>
    </div>
  );
}
