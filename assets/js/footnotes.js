// assets/js/footnotes.js

document.addEventListener('DOMContentLoaded', function() {
  const footnoteRefs = document.querySelectorAll('a.footnote'); // Updated selector
  const footnotesContainer = document.querySelector('.footnotes ol');

  if (!footnoteRefs || !footnotesContainer) {
    return;
  }

  const footnoteContentMap = {};
  const footnoteItems = footnotesContainer.querySelectorAll('li');
  footnoteItems.forEach(item => {
    const id = item.id;
    const contentClone = item.cloneNode(true);
    const reverseLink = contentClone.querySelector('.reversefootnote');
    if (reverseLink) {
      reverseLink.remove();
    }
    footnoteContentMap[id] = contentClone.innerHTML.trim();
  });

  // Store active tooltip and its ref to manage hover state
  let activeTooltip = null;
  let activeRef = null;

  footnoteRefs.forEach(ref => {
    const targetId = ref.getAttribute('href').substring(1);
    const tooltipContent = footnoteContentMap[targetId];

    if (tooltipContent) {
      const tooltip = document.createElement('div');
      tooltip.classList.add('tooltip');
      tooltip.innerHTML = tooltipContent;
      document.body.appendChild(tooltip);

      // Function to position the tooltip
      const positionTooltip = () => {
        if (!tooltip.classList.contains('visible')) return; // Only position if visible

        const refRect = ref.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = refRect.top + window.scrollY - tooltipRect.height - 15; // Increased buffer
        let left = refRect.left + window.scrollX + (refRect.width / 2) - (tooltipRect.width / 2);

        // Keep tooltip within viewport
        if (top < window.scrollY + 10) { // If it goes above, position below
          top = refRect.bottom + window.scrollY + 15;
          tooltip.style.bottom = 'auto';
          tooltip.style.top = `${top}px`;
          // Adjust arrow for bottom position
          tooltip.style.setProperty('--arrow-top', '-8px'); // Custom property for arrow
          tooltip.style.setProperty('--arrow-border', 'transparent transparent var(--tooltip-background) transparent');
        } else {
          tooltip.style.top = `${top}px`;
          tooltip.style.bottom = 'auto';
          // Adjust arrow for top position
          tooltip.style.setProperty('--arrow-top', '100%');
          tooltip.style.setProperty('--arrow-border', 'var(--tooltip-background) transparent transparent transparent');
        }

        if (left < 10) { // Add padding from left edge
          left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) { // Add padding from right edge
          left = window.innerWidth - tooltipRect.width - 10;
        }
        tooltip.style.left = `${left}px`;
      };

      ref.addEventListener('mouseenter', () => {
        // Hide any previously active tooltip before showing a new one
        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.classList.remove('visible');
          activeTooltip.style.opacity = '0';
          activeTooltip.style.visibility = 'hidden';
          activeTooltip.style.transform = 'translateY(5px)';
        }

        tooltip.classList.add('visible'); // Add class to trigger transition
        tooltip.style.visibility = 'visible'; // Keep visible for positioning
        tooltip.style.opacity = '1';
        positionTooltip(); // Initial positioning

        activeTooltip = tooltip;
        activeRef = ref;
      });

      ref.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
        tooltip.style.opacity = '0'; // Start fade out
        tooltip.style.transform = 'translateY(5px)'; // Move slightly down as it fades
        // Using a timeout to truly hide after transition completes
        setTimeout(() => {
          if (!tooltip.classList.contains('visible')) { // Only hide if mouse isn't back on it
            tooltip.style.visibility = 'hidden';
          }
        }, 200); // Matches transition duration
        activeTooltip = null;
        activeRef = null;
      });

      // Re-position on scroll or resize for better responsiveness
      window.addEventListener('scroll', () => {
        if (activeRef === ref && activeTooltip === tooltip) { // Only position the active tooltip
          positionTooltip();
        }
      });
      window.addEventListener('resize', () => {
        if (activeRef === ref && activeTooltip === tooltip) { // Only position the active tooltip
          positionTooltip();
        }
      });
    }
  });
});