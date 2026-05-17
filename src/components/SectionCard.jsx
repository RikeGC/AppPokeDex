export function SectionCard({
  as: Tag = 'section',
  title,
  subtitle,
  headerAction,
  className = '',
  children
}) {
  const classes = ['panel', 'section-card', className].filter(Boolean).join(' ');

  return (
    <Tag className={classes}>
      {(title || subtitle || headerAction) && (
        <div className="section-title section-card-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <span>{subtitle}</span>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </Tag>
  );
}
