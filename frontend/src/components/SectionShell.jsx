import { forwardRef } from "react";

const SectionShell = forwardRef(function SectionShell({ eyebrow, title, body, className = "", children }, ref) {
  return (
    <section ref={ref} className={`section-shell ${className}`}>
      <div className="section-head" data-reveal="up">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h2>{title}</h2>}
        {body && <p>{body}</p>}
      </div>
      {children}
    </section>
  );
});

export default SectionShell;
