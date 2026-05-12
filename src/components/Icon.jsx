export function Icon({ name, weight = 'regular', className = '' }) {
  return (
    <i
      className={`ph${weight === 'fill' ? '-fill' : ''} ph-${name} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
