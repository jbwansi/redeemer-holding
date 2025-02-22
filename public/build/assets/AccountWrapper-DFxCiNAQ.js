import{K as o,j as e,$ as i}from"./app-CiKuo7HJ.js";function c({children:t}){const{url:l}=o(),s=[{title:"Détails de compte",href:"profile.account"},{title:"Mot de passe & Sécurité",href:"profile.security"},{title:"Activités de connexion",href:"profile.activities"}];return e.jsxs("div",{className:"w-full px-2 sm:px-4 dark:bg-gray-950",children:[e.jsx("div",{className:"flex flex-col sm:flex-row overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700",children:e.jsx("div",{className:"flex sm:flex-row whitespace-nowrap",children:s.map((r,a)=>e.jsx(i,{href:route(r.href),className:`
                                flex-shrink-0
                                px-3 sm:px-4 py-2
                                text-sm sm:text-base font-medium
                                transition-colors duration-200
                                ${route().current()===r.href?"border-b-2 border-orange-600 text-orange-600 dark:text-orange-500":"text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}
                            `,children:r.title},a))})}),e.jsx("div",{className:"mt-5",children:t})]})}export{c as default};
