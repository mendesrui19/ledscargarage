export function renderProjectArticle(project, { featured = false } = {}) {
  const theme = project.theme ? ` ${project.theme}` : '';
  const photos = Array.from({ length: project.photos }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    const alt = project.alts[i] || `foto ${i + 1}`;
    const active = i === 0 ? ' is-active' : '';
    return `                <figure class="project-photo${active}">
                  <img src="/images/projects/${project.folder}/${num}.png" alt="${project.name} — ${alt}" width="1080" height="1080" loading="lazy" />
                </figure>`;
  }).join('\n');

  const specs = project.specs.map((s) => `                <li>${s}</li>`).join('\n');
  const waText = encodeURIComponent(`Olá! Vi o trabalho no ${project.name} e gostava de mais informações.`);

  return `        <article class="project-showcase${theme}" id="${project.id}" aria-label="${project.name}">
          <div class="project-showcase__layout">
            <div class="project-showcase__intro">
              <span class="eyebrow eyebrow--gold">${project.name}</span>
              <h3 class="section-title section-title--sm split-heading">
                ${project.tag.split(' ').slice(0, 2).join(' ')}<br /><span class="section-title__accent">${project.tag.split(' ').slice(2).join(' ') || 'premium'}</span>
              </h3>
              <ul class="project-showcase__list">
${specs}
              </ul>
              <p class="project-showcase__thanks">Obrigado pela preferência!</p>
              <div class="project-showcase__actions">
                <a href="https://wa.me/351900000000?text=${waText}" class="btn btn--primary magnetic" data-magnetic data-cursor="cta" target="_blank" rel="noopener noreferrer">
                  <span>Mais informações</span><span class="btn__shine"></span>
                </a>
                <a href="#contacto" class="btn btn--ghost magnetic" data-magnetic>Orçamento</a>
              </div>
              <div class="project-showcase__progress" aria-hidden="true">
                <div class="project-showcase__progress-fill"></div>
              </div>
              <p class="project-showcase__hint" aria-hidden="true">← deslize para ver as fotos →</p>
            </div>
            <div class="project-showcase__gallery-wrap">
              <div class="project-showcase__track">
${photos}
              </div>
            </div>
          </div>
        </article>`;
}
