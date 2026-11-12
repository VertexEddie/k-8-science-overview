(() => {
  const months = ['2026-09', '2026-10', '2026-11', '2026-12'];
  const monthTitle = key => {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const label = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const localMonthKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;

  function installCalendarMonths() {
    const heading = document.querySelector('.schedule-heading');
    const calendar = document.querySelector('.schedule-days.real-calendar');
    if (!heading || !calendar || heading.querySelector('.calendar-month-nav')) return;
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
        const centered = [...calendar.querySelectorAll('.schedule-day')].find(cell => cell.getBoundingClientRect().top <= center && cell.getBoundingClientRect().bottom >= center);
        const dateText = centered?.querySelector('time')?.textContent.trim();
        if (dateText) {
          const date = new Date(`${dateText} 2026`);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (months.includes(key) && key !== activeMonth) { activeMonth = key; updateControls(); }
        }
      });
    }, { passive: true });
    updateControls();
  }

  function installGrade6Modules(main) {
    const sidebar = main.querySelector('.course-nav');
    if (!sidebar || sidebar.querySelector('.module-quarter-disclosures')) return;
    const source = sidebar.querySelector('.module-index');
    const select = source?.querySelector('select');
    if (!select) return;
    const nav = document.createElement('nav');
    nav.className = 'course-nav-links';
    nav.setAttribute('aria-label', 'Grade 6 course modules');
    const groups = document.createElement('div');
    groups.className = 'quarter-disclosures module-quarter-disclosures';
    const label = document.createElement('span');
    label.className = 'nav-section';
    label.textContent = 'Course modules';
    groups.append(label);
    [...select.querySelectorAll('optgroup')].forEach((group, index) => {
      const section = document.createElement('section');
      section.className = 'quarter-disclosure';
      const panelId = `g6-module-list-${index + 1}`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'quarter-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      const quarterName = document.createElement('span');
      quarterName.textContent = group.label;
      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined quarter-chevron';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'expand_more';
      toggle.append(quarterName, arrow);
      const panel = document.createElement('div');
      panel.className = 'quarter-panel';
      panel.id = panelId;
      panel.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'quarter-panel-inner';
      const list = document.createElement('div');
      list.className = 'quarter-topic-list';
      [...group.querySelectorAll('option')].forEach(option => {
        const link = document.createElement('a');
        link.className = 'quarter-topic module-topic';
        link.href = `#${option.value}`;
        link.tabIndex = -1;
        const match = option.textContent.trim().match(/^M(\d+)\s*·\s*(.*)$/u);
        const copy = document.createElement('span');
        copy.className = 'module-topic-copy';
        const number = document.createElement('strong');
        number.textContent = match ? `Module ${match[1]}` : 'Module';
        const title = document.createElement('span');
        title.className = 'module-topic-title';
        title.textContent = match ? match[2] : option.textContent.trim();
        copy.append(number, title);
        link.append(copy);
        list.append(link);
      });
      inner.append(list);
      panel.append(inner);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        if (open && window.matchMedia('(max-width: 900px)').matches) {
          groups.querySelectorAll('.quarter-toggle[aria-expanded="true"]').forEach(other => {
            other.setAttribute('aria-expanded', 'false');
            other.closest('.quarter-disclosure')?.classList.remove('is-open');
            const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            if (otherPanel) {
              otherPanel.setAttribute('aria-hidden', 'true');
              otherPanel.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
            }
          });
        }
        toggle.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        panel.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
      });
      section.append(toggle, panel);
      groups.append(section);
    });
    nav.append(groups);
    source.replaceWith(nav);
  }

  function installGrade7and8Modules(main) {
    const sidebar = main.querySelector('.course-nav');
    if (!sidebar || sidebar.querySelector('.module-quarter-disclosures')) return;
    const isSeven = main.classList.contains('g7');
    const grade = isSeven ? 'g7' : 'g8';
    const quarters = [...main.querySelectorAll('.map-content > .quarter')];
    if (!quarters.length) return;
    const nav = document.createElement('nav');
    nav.className = 'course-nav-links';
    nav.setAttribute('aria-label', `Grade ${isSeven ? 7 : 8} course modules`);
    const groups = document.createElement('div');
    groups.className = 'quarter-disclosures module-quarter-disclosures';
    const label = document.createElement('span');
    label.className = 'nav-section';
    label.textContent = 'Course modules';
    groups.append(label);
    let number = 0;
    quarters.forEach((quarter, quarterIndex) => {
      const section = document.createElement('section');
      section.className = 'quarter-disclosure';
      const panelId = `${grade}-module-list-${quarterIndex + 1}`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'quarter-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      const quarterName = document.createElement('span');
      quarterName.textContent = quarter.querySelector('.sheet > header span')?.textContent.trim() || `Quarter ${quarterIndex + 1}`;
      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined quarter-chevron';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'expand_more';
      toggle.append(quarterName, arrow);
      const panel = document.createElement('div');
      panel.className = 'quarter-panel';
      panel.id = panelId;
      panel.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'quarter-panel-inner';
      const list = document.createElement('div');
      list.className = 'quarter-topic-list';
      const cards = [...quarter.querySelectorAll(isSeven ? '.g7-lesson' : '.assignment-lesson, .folder-lesson')];
      cards.forEach(card => {
        number += 1;
        card.id = `${grade}m${number}`;
        const rawTitle = (isSeven ? card.querySelector('.g6-lesson-title span:first-child') : card.querySelector('.lesson-heading a'))?.textContent.trim() || `Module ${number}`;
        const titleText = rawTitle.includes('|') ? rawTitle.split('|').pop().trim() : rawTitle;
        const link = document.createElement('a');
        link.className = 'quarter-topic module-topic';
        link.href = `#${card.id}`;
        link.tabIndex = -1;
        const copy = document.createElement('span');
        copy.className = 'module-topic-copy';
        const module = document.createElement('strong');
        module.textContent = `Module ${number}`;
        const title = document.createElement('span');
        title.className = 'module-topic-title';
        title.textContent = titleText;
        copy.append(module, title);
        link.append(copy);
        list.append(link);
      });
      inner.append(list);
      panel.append(inner);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        if (open && window.matchMedia('(max-width: 900px)').matches) {
          groups.querySelectorAll('.quarter-toggle[aria-expanded="true"]').forEach(other => {
            other.setAttribute('aria-expanded', 'false');
            other.closest('.quarter-disclosure')?.classList.remove('is-open');
            const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            if (otherPanel) { otherPanel.setAttribute('aria-hidden', 'true'); otherPanel.querySelectorAll('a').forEach(link => { link.tabIndex = -1; }); }
          });
        }
        toggle.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        panel.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
      });
      section.append(toggle, panel);
      groups.append(section);
    });
    nav.append(groups);
    const oldNav = sidebar.querySelector('.course-nav-links');
    if (oldNav) oldNav.replaceWith(nav);
    else sidebar.append(nav);
  }

  function installCourseLayouts() {
    const main = document.querySelector('.course-layout.g6:not(.calendar-layout), .course-layout.g7, .course-layout.g8, #g8.course-layout');
    if (!main) return;
    const sidebar = main.querySelector('.course-nav');
    const content = main.querySelector('.map-content');
    if (!sidebar || !content) return;
    const isGrade6 = main.classList.contains('g6');
    if (isGrade6) installGrade6Modules(main);
    else installGrade7and8Modules(main);
    const masthead = content.querySelector(':scope > .masthead');
    const resources = masthead?.querySelector('.grade-resources');
    let filterMenu = masthead?.querySelector('.g6-filter-menu');
    if (!filterMenu && !isGrade6) {
      const filter = masthead?.querySelector('.course-filter');
      if (filter) {
        filterMenu = document.createElement('details');
        filterMenu.className = 'g6-filter-menu';
        const summary = document.createElement('summary');
        summary.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">tune</span><span>Filters</span><span class="material-symbols-outlined filter-chevron" aria-hidden="true">expand_more</span>';
        filterMenu.append(summary, filter);
      }
    }
    if (resources && !sidebar.contains(resources)) {
      resources.querySelectorAll('a').forEach(link => {
        if (!link.textContent.toLowerCase().includes('reteach')) return;
        const icon = link.querySelector('.material-symbols-outlined');
        link.replaceChildren(...(icon ? [icon] : []), document.createTextNode('Reteach & Review'));
      });
      const moduleNav = sidebar.querySelector('.course-nav-links, .module-quarter-disclosures');
      sidebar.insertBefore(resources, moduleNav || null);
    }
    if (filterMenu && !content.querySelector(':scope > .g6-filter-row')) {
      const row = document.createElement('div');
      row.className = 'g6-filter-row';
      row.append(filterMenu);
      const firstQuarter = content.querySelector(':scope > .quarter');
      content.insertBefore(row, firstQuarter || null);
    }
    if (filterMenu && filterMenu.parentElement === masthead) filterMenu.remove();
    masthead?.remove();
  }

  function installScheduleDefaults() {
    const main = document.querySelector('.all-schedule-layout');
    if (!main) return;
    const switcher = main.querySelector('.schedule-switcher');
    if (switcher && main.dataset.defaultGradeViewApplied !== 'true') {
      const allGrades = [...switcher.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'all grades');
      if (!allGrades) return;
      if (allGrades.getAttribute('aria-pressed') !== 'true') allGrades.click();
      main.dataset.defaultGradeViewApplied = 'true';
    }
    const calendar = main.querySelector('.schedule-days.real-calendar');
    const today = calendar?.querySelector('.schedule-day.is-current');
    if (!calendar || !today || calendar.dataset.currentDatePositioned === 'true') return;
    calendar.dataset.currentDatePositioned = 'pending';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!calendar.isConnected || !today.isConnected) return;
      const top = today.getBoundingClientRect().top - calendar.getBoundingClientRect().top + calendar.scrollTop;
      calendar.scrollTop = Math.max(0, top);
      calendar.dataset.currentDatePositioned = 'true';
    }));
  }

  const observer = new MutationObserver(() => {
    installCalendarMonths();
    installCourseLayouts();
    installScheduleDefaults();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  installCalendarMonths();
  installCourseLayouts();
  installScheduleDefaults();
})();

