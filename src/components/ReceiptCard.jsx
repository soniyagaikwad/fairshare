import { formatDate } from '../utils/constants';

export default function ReceiptCard({
  title,
  date,
  children,
  footer,
  torn = true,
}) {
  return (
    <div className={`receipt ${torn ? 'receipt--torn-top' : ''}`}>
      <div className="receipt__header">
        <div className="receipt__header-title">{title}</div>
        {date && (
          <div className="receipt__header-date">{formatDate(date)}</div>
        )}
      </div>
      <div className="receipt__body">{children}</div>
      {footer && (
        <>
          <div className="receipt__perforation" />
          <div className="receipt__footer">{footer}</div>
        </>
      )}
    </div>
  );
}

export function ReceiptDivider({ light = false }) {
  return (
    <hr className={`receipt__divider ${light ? 'receipt__divider--light' : ''}`} />
  );
}

export function ReceiptRow({ label, amount, header, total, className = '' }) {
  const rowClass = [
    'receipt__row',
    header ? 'receipt__row--header' : '',
    total ? 'receipt__row--total' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      <span>{label}</span>
      {amount !== undefined && (
        <span className={`receipt__amount ${total ? 'receipt__amount--large' : ''}`}>
          {amount}
        </span>
      )}
    </div>
  );
}

export function ReceiptSection({ label, children }) {
  return (
    <div>
      {label && <div className="receipt__section-label">{label}</div>}
      {children}
    </div>
  );
}
