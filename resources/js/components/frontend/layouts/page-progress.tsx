import React, { useEffect, useMemo, useState } from 'react';

type ProgressSection = {
  id: string;
  label: string;
};

export default function PageProgress() {
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<ProgressSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('main [id][data-progress-label]')
    );

    const sectionList = nodes.map((node) => ({
      id: node.id,
      label: node.dataset.progressLabel || node.id,
    }));

    setSections(sectionList);
    setActiveSectionId(sectionList[0]?.id || '');

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.25, 0.5, 0.75],
      }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      setProgress(Math.round(ratio * 100));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId),
    [sections, activeSectionId]
  );

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-[72px] z-40 h-1 bg-slate-200/40 dark:bg-slate-800/60">
        <div
          className="h-full bg-gradient-to-r from-[#DA2E29] to-rose-600 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {sections.length > 0 && (
        <div className="pointer-events-none fixed bottom-6 right-4 z-40 hidden rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur md:block dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
          {activeSection ? `${activeSection.label} · ${progress}%` : `${progress}%`}
        </div>
      )}
    </>
  );
}
