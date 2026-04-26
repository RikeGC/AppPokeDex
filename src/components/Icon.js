import { h } from '../lib/react.js';

export function Icon({ name, weight = 'regular', className = '' }) {
  return h('i', {
    className: `ph${weight === 'fill' ? '-fill' : ''} ph-${name} ${className}`.trim(),
    'aria-hidden': 'true'
  });
}
