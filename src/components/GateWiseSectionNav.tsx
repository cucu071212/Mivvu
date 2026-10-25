const SECTIONS = [
  { id: "gw-section-context", label: "Flight" },
  { id: "gw-section-find", label: "Find" },
  { id: "gw-section-estimates", label: "Estimates" },
  { id: "gw-section-results", label: "Results" },
  { id: "gw-section-whatif", label: "What-if" },
  { id: "gw-section-map", label: "Map" },
] as const;

export function GateWiseSectionNav() {
  return (
    <nav
      className="gw-section-nav"
      aria-label="Page sections"
    >
      <ul className="gw-section-nav-list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a className="gw-section-nav-link" href={`#${section.id}`}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
