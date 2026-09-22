import{a as e}from"./rolldown-runtime-B0Z9INg1.js";import{i as t}from"./vendor--dnd-kit-accessibility-DG5krVQ3.js";import{t as n}from"./vendor-editor-7OmcssU5.js";import{s as r}from"./vendor-motion-DtFgrr9H.js";import{S as i}from"./app-Ax6ync0W.js";import{t as a}from"./vendor-dompurify-CYRiAeUx.js";var o=e(t(),1),s=r(),c={".ql-bold":`Gras`,".ql-italic":`Italique`,".ql-underline":`Souligné`,".ql-strike":`Barré`,".ql-blockquote":`Citation`,".ql-header":`Titre`,".ql-list":`Liste`,".ql-indent":`Retrait`,".ql-align":`Alignement`,".ql-color":`Couleur du texte`,".ql-background":`Couleur de fond`,".ql-font":`Police`,".ql-link":`Lien`,".ql-clean":`Effacer le formatage`};function l({toolbarMode:e,allowLinks:t,allowHeadings:n}){let r=[[...n?[{header:[!1,2,3]}]:[],`blockquote`,`code-block`],[{align:``},{align:`center`},{align:`right`},{align:`justify`}],[`bold`,`italic`,`underline`,`strike`],[{color:[]},{background:[]}],[{script:`sub`},{script:`super`}],[{list:`ordered`},{list:`bullet`},{indent:`-1`},{indent:`+1`}],[{font:[]}],[...t?[`link`]:[],`clean`]],i=[[...n?[{header:[!1,2,3]}]:[],`bold`,`italic`,`underline`,...t?[`link`]:[]],[{list:`ordered`},{list:`bullet`}],[{font:[]},`clean`]],a=[`bold`,`italic`,`underline`,`strike`,`blockquote`,`list`,`ordered`,`bullet`,`indent`,`align`,`color`,`background`,`font`,`code-block`,...n?[`header`]:[],...t?[`link`]:[]];return{container:e===`compact`?i:r,formats:a}}function u(e){let t=e.trim();if(!t||/^(javascript|data|vbscript):/i.test(t))return!1;try{let e=new URL(t,window.location.href);return[`http:`,`https:`,`mailto:`,`tel:`].includes(e.protocol)||t.startsWith(`/`)||t.startsWith(`#`)}catch{return t.startsWith(`/`)||t.startsWith(`#`)}}function d(e){let t=a.sanitize(e,{ALLOWED_TAGS:`p.br.strong.b.em.i.u.s.strike.del.blockquote.ul.ol.li.h1.h2.h3.a.span.div.section.code.pre.sub.sup.mark.font.table.thead.tbody.tr.td.th.hr`.split(`.`),ALLOWED_ATTR:[`href`,`title`,`target`,`rel`,`align`,`color`,`background`,`face`],FORBID_TAGS:[`script`,`style`,`iframe`,`object`,`embed`,`link`,`meta`,`svg`,`math`],FORBID_ATTR:[`style`,`class`,`id`,`name`,`srcdoc`],ALLOW_UNKNOWN_PROTOCOLS:!1}),n=document.createElement(`div`);return n.innerHTML=t,n.querySelectorAll(`*`).forEach(e=>{let t=e;if(t.tagName.toLowerCase()===`a`){let e=t.getAttribute(`href`);(!e||!u(e))&&t.removeAttribute(`href`),t.getAttribute(`target`)===`_blank`?t.setAttribute(`rel`,`noopener noreferrer nofollow`):t.removeAttribute(`target`)}if([`div`,`section`].includes(t.tagName.toLowerCase())){let e=t.parentElement;if(!e||e.closest(`table`))return;let n=document.createDocumentFragment();if(Array.from(t.childNodes).some(e=>e.nodeType===Node.ELEMENT_NODE&&[`p`,`ul`,`ol`,`blockquote`,`h1`,`h2`,`h3`,`pre`,`table`].includes(e.tagName.toLowerCase()))){for(;t.firstChild;)n.appendChild(t.firstChild);e.insertBefore(n,t)}else{let n=document.createElement(`p`);for(;t.firstChild;)n.appendChild(t.firstChild);e.insertBefore(n,t)}e.removeChild(t)}}),n.querySelectorAll(`span, font`).forEach(e=>{let t=e;!t.textContent?.trim()&&!t.querySelector(`img, a, br`)&&t.remove()}),n.innerHTML.trim()}function f(e,t){let n=e.container.querySelector(`.ql-toolbar`);if(!n||(Object.entries(c).forEach(([e,t])=>{let r=n.querySelector(e);r&&(r.setAttribute(`aria-label`,t),r.setAttribute(`title`,t))}),!t))return;let r=n.querySelector(`.ql-custom-undo`),i=n.querySelector(`.ql-custom-redo`);r&&r.remove(),i&&i.remove();let a=document.createElement(`button`);a.type=`button`,a.className=`ql-custom-undo`,a.innerHTML=`<span aria-hidden="true">↶</span>`,a.setAttribute(`aria-label`,`Annuler`),a.setAttribute(`title`,`Annuler`),a.addEventListener(`click`,()=>e.history.undo());let o=document.createElement(`button`);o.type=`button`,o.className=`ql-custom-redo`,o.innerHTML=`<span aria-hidden="true">↷</span>`,o.setAttribute(`aria-label`,`Rétablir`),o.setAttribute(`title`,`Rétablir`),o.addEventListener(`click`,()=>e.history.redo()),n.appendChild(a),n.appendChild(o)}function p(e,t,n){let r=e.getSelection(!0),i=r?r.index:0,a=r?r.length:0;if(a>0&&e.deleteText(i,a,`user`),t.trim()){e.clipboard.dangerouslyPasteHTML(i,t,`user`);let r=(n??t.replace(/<[^>]*>/g,``)).length;e.setSelection(i+r,0,`silent`);return}n&&(e.insertText(i,n,`user`),e.setSelection(i+n.length,0,`silent`))}function m({id:e,value:t=``,onChange:r,readOnly:a=!1,placeholder:c,label:u,error:m,className:h,labelClassName:g,errorClassName:_,toolbarPosition:v=`top`,toolbarMode:y=`full`,allowLinks:b=!0,allowHeadings:x=!0,allowHistory:S=!0,...C}){let w=(0,o.useRef)(null),T=(0,o.useRef)(null),E=(0,o.useRef)(r),D=(0,o.useRef)(!1),O=(0,o.useMemo)(()=>l({toolbarMode:y,allowLinks:b,allowHeadings:x}),[y,b,x]);return(0,o.useEffect)(()=>{E.current=r},[r]),(0,o.useEffect)(()=>{if(!w.current||T.current)return;let e=new n(w.current,{theme:`snow`,formats:O.formats,modules:{toolbar:{container:O.container,handlers:{link:function(){let t=e.getSelection(),n=window.prompt(`URL du lien`,(t&&t.length,`https://`));if(!n)return;let r=/^https?:\/\//i.test(n)||n.startsWith(`/`)||n.startsWith(`#`)?n:`https://${n}`;e.format(`link`,r,`user`)}}},history:{delay:500,maxStack:100,userOnly:!1},clipboard:{matchVisual:!1}},placeholder:c,readOnly:a});T.current=e,e.root.style.minHeight=`320px`,e.root.style.lineHeight=`1.7`,e.root.style.fontSize=`1rem`,c&&e.root.setAttribute(`data-placeholder`,c);let r=t=>{let n=t.clipboardData?.getData(`text/html`),r=t.clipboardData?.getData(`text/plain`);if(!(!n&&!r)){if(t.preventDefault(),n){let t=d(n);t&&p(e,t,r||t.replace(/<[^>]*>/g,``));return}r&&p(e,``,r)}};e.root.addEventListener(`paste`,r),f(e,S),t&&(D.current=!0,e.clipboard.dangerouslyPasteHTML(t,`user`),D.current=!1);let i=()=>{if(!D.current){let t=e.root.innerHTML;E.current?.(t===`<p><br></p>`?``:t)}};return e.on(`text-change`,i),()=>{e.root.removeEventListener(`paste`,r),e.off(`text-change`,i),T.current=null,w.current?.replaceChildren()}},[]),(0,o.useEffect)(()=>{let e=T.current;e&&(e.root.innerHTML===`<p><br></p>`?``:e.root.innerHTML)!==t&&(D.current=!0,e.clipboard.dangerouslyPasteHTML(t??``,`user`),D.current=!1)},[t]),(0,o.useEffect)(()=>{T.current?.enable(!a)},[a]),(0,o.useEffect)(()=>{if(!T.current)return;let e=T.current;c?e.root.setAttribute(`data-placeholder`,c):e.root.removeAttribute(`data-placeholder`)},[c]),(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`style`,{children:`
        .react-quill {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .react-quill .ql-toolbar.ql-snow {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 8px;
          align-items: center;
          padding: 10px 12px;
        }
        .react-quill .ql-toolbar.ql-snow .ql-formats {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-right: 4px;
          margin-bottom: 0;
        }
        .react-quill .ql-toolbar.ql-snow button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          min-height: 28px;
          border-radius: 4px;
        }
        .react-quill .ql-toolbar.ql-snow button:hover {
          background: rgba(15, 23, 42, 0.04);
        }
        .react-quill-toolbar-bottom .ql-toolbar {
          order: 2;
        }
        .react-quill-toolbar-bottom .ql-container {
          order: 1;
        }
        .react-quill .ql-container.ql-snow {
          min-height: 320px;
        }
        .react-quill .ql-editor {
          min-height: 320px;
          line-height: 1.7;
        }
      `}),(0,s.jsxs)(`div`,{...C,id:e,className:i(`react-quill`,v===`bottom`&&`react-quill-toolbar-bottom relative`,h),children:[u&&(0,s.jsx)(`label`,{className:i(`mb-1.5 block`,g),children:u}),(0,s.jsx)(`div`,{ref:w,"aria-label":typeof u==`string`?u:void 0}),m&&(0,s.jsx)(`p`,{className:i(`mt-1 text-sm text-destructive`,_),children:m})]})]})}export{m as t};