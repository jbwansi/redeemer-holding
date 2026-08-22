import{a as e}from"./rolldown-runtime-B0Z9INg1.js";import{i as t}from"./vendor--dnd-kit-accessibility-DG5krVQ3.js";import{r as n,t as r}from"./vendor-inertia-BKsPgkK7.js";import{a as i,i as a,n as o,s}from"./vendor-motion-DtFgrr9H.js";import{Ct as c,gr as l,yi as u}from"./vendor-lucide-c-iJMbwfi-.js";import{t as d}from"./vendor-lucide-e-DLsX_EB6.js";import{tr as f}from"./vendor-lucide-s-fkZguwuC.js";import{w as p}from"./app-WyQX9K8k.js";import{t as m}from"./vendor-ziggy-js-BekYfrW-.js";import{t as h}from"./front-layout-DJaKGy3_.js";import{t as g}from"./vendor-dompurify-CYRiAeUx.js";var _=e(t(),1),v=s(),y=e=>e?typeof e==`string`?e:e?.large||e?.medium||e?.original||e?.thumbnail||`/assets/images/services-bg.jpg`:`/assets/images/services-bg.jpg`,b=({post:e,relatedPosts:t})=>{let s=e?.data,b=t?.data||[],x=(0,_.useMemo)(()=>g.sanitize(s?.content||``),[s?.content]),S=(0,_.useRef)(null),{scrollYProgress:C}=a({target:S,offset:[`start start`,`end end`]}),w=o(C,[0,1],[0,1]);return(0,v.jsxs)(h,{children:[(0,v.jsx)(n,{title:s?.title||`Blog`}),(0,v.jsx)(i.div,{className:`fixed top-0 left-0 right-0 z-50 h-1 origin-left bg-[#da2e29]`,style:{scaleX:w}}),(0,v.jsxs)(`main`,{ref:S,className:`min-h-screen bg-white pt-24 pb-20 dark:bg-slate-950`,children:[(0,v.jsxs)(`section`,{className:`mx-auto max-w-[980px] px-6`,children:[(0,v.jsxs)(r,{href:m(`blogs`),className:`mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#da2e29] dark:text-slate-400`,children:[(0,v.jsx)(l,{className:`h-4 w-4`}),`Retour au blog`]}),(0,v.jsxs)(`header`,{className:`mb-10`,children:[s?.category&&(0,v.jsx)(`span`,{className:`inline-flex rounded-full bg-[#da2e29] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white`,children:s.category}),(0,v.jsx)(`h1`,{className:`mt-6 max-w-4xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl dark:text-white`,children:s?.title}),s?.excerpt&&(0,v.jsx)(`p`,{className:`mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl dark:text-slate-300`,children:s.excerpt})]}),(0,v.jsx)(`div`,{className:`mb-10 overflow-hidden rounded-3xl shadow-xl`,children:(0,v.jsx)(`img`,{src:y(s?.coverImage),alt:s?.title||`Image de couverture`,loading:`eager`,decoding:`async`,className:`w-full object-contain`})}),(0,v.jsxs)(`div`,{className:`rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10 dark:border-slate-800 dark:bg-slate-900/80`,children:[(0,v.jsxs)(`div`,{className:`mb-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60`,children:[(0,v.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,v.jsx)(`img`,{src:s?.author?.avatar||`/assets/images/avatar.jpg`,alt:s?.author?.name||`Auteur`,className:`h-12 w-12 rounded-full object-cover`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`p`,{className:`font-semibold text-slate-900 dark:text-white`,children:s?.author?.name||`Redeemer Holding`}),(0,v.jsxs)(`div`,{className:`mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400`,children:[(0,v.jsxs)(`span`,{className:`inline-flex items-center gap-1.5`,children:[(0,v.jsx)(u,{className:`h-4 w-4`}),p(s?.publishedAt)]}),(0,v.jsxs)(`span`,{className:`inline-flex items-center gap-1.5`,children:[(0,v.jsx)(c,{className:`h-4 w-4`}),s?.readTime]}),(0,v.jsxs)(`span`,{className:`inline-flex items-center gap-1.5`,children:[(0,v.jsx)(d,{className:`h-4 w-4`}),s?.views||0,` vues`]})]})]})]}),(0,v.jsxs)(`button`,{onClick:async()=>{try{let e=window.location.href;if(navigator.share){await navigator.share({title:s?.title,text:s?.excerpt,url:e});return}await navigator.clipboard.writeText(e)}catch{return}},type:`button`,className:`inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800`,children:[(0,v.jsx)(f,{className:`h-4 w-4`}),`Partager`]})]}),(0,v.jsx)(`article`,{className:`
    max-w-none
    text-[16px]
    leading-[1.45]
    text-slate-700
    dark:text-slate-100

    [&_p]:mb-1
    [&_p]:text-[16px]
    [&_p]:leading-[1.45]

    [&_h1]:mb-2
    [&_h1]:text-[24px]
    [&_h1]:font-bold
    [&_h1]:leading-tight

    [&_h2]:mt-6
    [&_h2]:mb-2
    [&_h2]:text-[22px]
    [&_h2]:font-semibold
    [&_h2]:leading-tight

    [&_h3]:mt-5
    [&_h3]:mb-2
    [&_h3]:text-[18px]
    [&_h3]:font-semibold

    [&_ul]:my-1
    [&_ul]:ml-6
    [&_ul]:list-disc

    [&_li]:my-0
    [&_li]:pl-1
    [&_li]:leading-[1.45]

    [&_strong]:font-bold
    [&_strong]:text-slate-900
    dark:[&_strong]:text-white
  `,dangerouslySetInnerHTML:{__html:x}})]}),Array.isArray(s?.tags)&&s.tags.length>0&&(0,v.jsx)(`div`,{className:`mx-auto mt-14 flex flex-wrap gap-3`,children:s.tags.map(e=>(0,v.jsxs)(`span`,{className:`rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300`,children:[`#`,e]},e))})]}),b.length>0&&(0,v.jsxs)(`section`,{className:`mx-auto mt-24 max-w-7xl px-6`,children:[(0,v.jsx)(`h2`,{className:`mb-10 text-3xl font-bold text-slate-950 dark:text-white`,children:`Articles similaires`}),(0,v.jsx)(`div`,{className:`grid gap-8 md:grid-cols-3`,children:b.map(e=>(0,v.jsxs)(`article`,{className:`overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-2 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900`,children:[(0,v.jsx)(r,{href:m(`blogs.details`,e.slug),children:(0,v.jsx)(`img`,{src:y(e.coverImage),alt:e.title,className:`h-56 w-full object-cover`})}),(0,v.jsxs)(`div`,{className:`p-6`,children:[(0,v.jsx)(`h3`,{className:`text-xl font-semibold text-slate-950 dark:text-white`,children:(0,v.jsx)(r,{href:m(`blogs.details`,e.slug),children:e.title})}),(0,v.jsx)(`p`,{className:`mt-4 line-clamp-3 text-slate-600 dark:text-slate-300`,children:e.excerpt})]})]},e.id))})]})]})]})};export{b as default};