export function fixedBlock(
  fixedSelector,
  contentSelector,
  { topPosition = 80, onChange = () => {} } = {},
) {
  const fixed = document.querySelector(fixedSelector);
  const content = document.querySelector(contentSelector);

  if (!fixed || !content) return;

  let wasFixed;

  function updateHeight() {
    if (!wasFixed) fixed.style.height = `${content.getBoundingClientRect().height}px`;
  }

  function update() {
    const isFixed = fixed.getBoundingClientRect().top <= topPosition;

    if (isFixed === wasFixed) return;

    updateHeight();
    wasFixed = isFixed;
    content.dataset.fixed = String(isFixed);
    onChange(isFixed);

    updateHeight();
  }

  new ResizeObserver(updateHeight).observe(content, { box: 'border-box' });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  update();
}
