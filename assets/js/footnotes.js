// assets/js/footnotes.js

document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. APPLY SMALL CAPS FIRST ---
  const postSections = document.querySelectorAll('.blogbody > p:first-of-type, .blogbody h2 + p, .blogbody h3 + p, .blog-post h2 + p, .blog-post h3 + p');
  
  postSections.forEach(p => {
    // Target only the first text node to avoid breaking links or other HTML tags
    const firstNode = p.childNodes[0];
    if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
      const text = firstNode.textContent.trimStart();
      const words = text.split(/\s+/); 

      if (words.length >= 4) {
        const firstFour = words.slice(0, 4).join(' ');
        const remainder = text.slice(firstFour.length);
        
        const span = document.createElement('span');
        span.className = 'intro-caps';
        span.textContent = firstFour;
        
        // Update the text node to remove the first 4 words and insert the span
        firstNode.textContent = remainder;
        p.insertBefore(span, p.firstChild);
      }
    }
  });

  // --- 2. INITIALIZE FOOTNOTES SECOND ---
  const footnoteRefs = document.querySelectorAll('a.footnote');
  const footnotesContainer = document.querySelector('.footnotes ol');

  if (!footnoteRefs || !footnotesContainer) return;

  const footnoteContentMap = {};
  const footnoteItems = footnotesContainer.querySelectorAll('li');

  footnoteItems.forEach(item => {
    const id = item.id;
    const contentClone = item.cloneNode(true);
    const reverseLink = contentClone.querySelector('.reversefootnote');
    if (reverseLink) reverseLink.remove();
    footnoteContentMap[id] = contentClone.innerHTML.trim();
    item.innerHTML = item.innerHTML.replace(/\[\[more\]\]/g, "");
  });

  let activeTooltip = null;
  let activeRef = null;

  footnoteRefs.forEach(ref => {
    const targetId = ref.getAttribute('href').substring(1);
    let tooltipContent = footnoteContentMap[targetId];

    if (tooltipContent) {
      const delimiter = "[[more]]";
      if (tooltipContent.includes(delimiter)) {
        tooltipContent = tooltipContent.split(delimiter)[0].trim();
        tooltipContent += '<span class="read-more-hint"> (Jump to footnote for more.)</span>';
        if (tooltipContent.toLowerCase().includes('<p') && !tooltipContent.toLowerCase().includes('</p')) {
          tooltipContent += '</p>';
        }
      }

      const tooltip = document.createElement('div');
      tooltip.classList.add('tooltip');
      tooltip.innerHTML = tooltipContent;
      document.body.appendChild(tooltip);

      const positionTooltip = () => {
        if (!tooltip.classList.contains('visible')) return;
        const refRect = ref.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        let top = refRect.top + window.scrollY - tooltipRect.height - 15;
        let left = refRect.left + window.scrollX + (refRect.width / 2) - (tooltipRect.width / 2);

        if (top < window.scrollY + 10) {
          top = refRect.bottom + window.scrollY + 15;
          tooltip.style.setProperty('--arrow-top', '-8px');
        } else {
          tooltip.style.setProperty('--arrow-top', '100%');
        }

        if (left < 10) left = 10;
        else if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
      };

      ref.addEventListener('mouseenter', () => {
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove('visible');
          activeTooltip.style.visibility = 'hidden';
        }
        tooltip.classList.add('visible');
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        positionTooltip();
        activeTooltip = tooltip;
        activeRef = ref;
      });

      ref.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
        tooltip.style.opacity = '0';
        setTimeout(() => {
          if (!tooltip.classList.contains('visible')) tooltip.style.visibility = 'hidden';
        }, 200);
        activeTooltip = null;
        activeRef = null;
      });
    }
  });
});