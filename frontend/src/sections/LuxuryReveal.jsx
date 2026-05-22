const cards = [
  ["Product Strategy", "Research-backed roadmaps, scope clarity, technical architecture, and launch choreography."],
  ["Web Platforms", "High-performance React interfaces, CMS workflows, dashboards, and conversion-focused journeys."],
  ["Mobile Apps", "iOS and Android product experiences with clean flows, service layers, and release discipline."],
  ["Automation", "CRM, billing, AI assistant, reporting, and operations pipelines that remove manual drag."],
];

export default function LuxuryReveal() {
  return (
    <section className="luxury-reveal section-shell" data-section="03">
      <div className="section-head" data-reveal="left">
        <span className="eyebrow">Editorial systems</span>
        <h2>Every screen arrives with presence.</h2>
        <p>
          We design digital service brands like private infrastructure: quiet, powerful, secure, and unmistakably
          premium.
        </p>
      </div>
      <div className="reveal-grid">
        {cards.map(([title, body], index) => (
          <article key={title} className="feature-card" data-reveal={index % 2 ? "right" : "left"}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
