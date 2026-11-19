export default function SectionHead({
  index,
  title,
  aside,
}: {
  index: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="section-head" data-reveal>
      <span className="section-head__idx">{index}</span>
      <h2 className="section-head__title">{title}</h2>
      {aside ? <div className="section-head__aside">{aside}</div> : null}
    </div>
  );
}
