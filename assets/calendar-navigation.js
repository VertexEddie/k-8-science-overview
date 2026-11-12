(() => {
  const months = ['2026-09', '2026-10', '2026-11', '2026-12'];
  const monthTitle = key => {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const label = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const localMonthKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;

  function install() {
    const heading = document.querySelector('.schedule-heading');
    const calendar = document.querySelector('.schedule-days.real-calendar');
    if (!heading || !calendar || heading.querySelector('.calendar-month-nav')) return false;
    const oldTitle = heading.querySelector('h2');
    const monthNav = document.createElement('div');
    monthNav.className = 'calendar-month-nav';
    monthNav.setAttribute('aria-label', 'Calendar month navigation');
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous month');
    previous.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    const title = document.createElement('h2');
    title.setAttribute('aria-live', 'polite');
    const next = document.createElement('button');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next month');
    next.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
    const todayButton = document.createElement('button');
    todayButton.type = 'button';
    todayButton.className = 'calendar-today-button';
    todayButton.textContent = 'Today';
    monthNav.append(previous, title, next, todayButton);
    if (oldTitle) oldTitle.replaceWith(monthNav);
    else heading.prepend(monthNav);
    const instructions = heading.querySelector('.schedule-key');
    if (instructions) instructions.textContent = 'Use the arrows to move month by month, or scroll through nearby weeks.';

    let activeMonth = months.includes(localMonthKey(new Date())) ? localMonthKey(new Date()) : months[0];
    const dayFor = date => [...calendar.querySelectorAll('.schedule-day')].find(cell => cell.querySelector('time')?.textContent.trim() === label(date));
    const scrollTo = date => {
      const cell = dayFor(date);
      if (!cell) return;
      const top = cell.getBoundingClientRect().top - calendar.getBoundingClientRect().top + calendar.scrollTop;
      calendar.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    const updateControls = () => {
      title.textContent = monthTitle(activeMonth);
      const index = months.indexOf(activeMonth);
      previous.disabled = index <= 0;
      next.disabled = index >= months.length - 1;
    };
    const goMonth = offset => {
      const index = months.indexOf(activeMonth) + offset;
      if (index < 0 || index >= months.length) return;
      activeMonth = months[index];
      updateControls();
      const [year, month] = activeMonth.split('-').map(Number);
      const first = new Date(year, month - 1, 1);
      while (first.getDay() === 0 || first.getDay() === 6) first.setDate(first.getDate() + 1);
      scrollTo(first);
    };
    previous.addEventListener('click', () => goMonth(-1));
    next.addEventListener('click', () => goMonth(1));
    todayButton.addEventListener('click', () => {
      const today = new Date();
      const key = localMonthKey(today);
      activeMonth = months.includes(key) ? key : months[months.length - 1];
      updateControls();
      const cell = dayFor(today);
      if (cell) { cell.click(); scrollTo(today); }
    });
    let frame = 0;
    calendar.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = calendar.getBoundingClientRect();
        const center = bounds.top + bounds.height / 2;
        const first = [...calendar.querySelectorAll('.schedule-day')].find(cell => cell.getBoundingClientRect().top <= center && cell.getBoundingClientRect().bottom >= center);
        const dateText = first?.querySelector('time')?.textContent.trim();
        if (dateText) {
          const date = new Date(`${dateText} 2026`);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (months.includes(key) && key !== activeMonth) { activeMonth = key; updateControls(); }
        }
      });
    }, { passive: true });
    updateControls();
    return true;
  }

  const observer = new MutationObserver(() => { install(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  install();
})();
