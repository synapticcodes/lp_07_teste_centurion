type HtmlSnippetSectionProps = {
  html: string;
};

export const HtmlSnippetSection = ({ html }: HtmlSnippetSectionProps) => (
  <section className="bg-white">
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-14">
      {/* Renderiza HTML bruto fornecido pelo negócio. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </section>
);
