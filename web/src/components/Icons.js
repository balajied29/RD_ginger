/**
 * Small functional icon set (heroicons-style outlines). Icons carry
 * meaning for users with limited English — every key action pairs an
 * icon with one short word.
 */
function Svg({ d, className = 'h-6 w-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export const HomeIcon = (p) => (
  <Svg {...p} d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />
);

export const BuyIcon = (p) => (
  <Svg {...p} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
);

export const PayIcon = (p) => (
  <Svg {...p} d="M3 7h18v10H3zM3 11h18M7 15h.01M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
);

export const PeopleIcon = (p) => (
  <Svg {...p} d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM22 21v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
);

export const ExitIcon = (p) => (
  <Svg {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
);

export const CheckIcon = (p) => <Svg {...p} d="M4 12.5 10 18 20 6" />;

export const WarnIcon = (p) => (
  <Svg {...p} d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
);
