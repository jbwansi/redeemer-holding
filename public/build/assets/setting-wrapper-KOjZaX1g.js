import{K as i,j as e,$ as o}from"./app-BINBw-6S.js";function x({children:r}){const{url:l}=i(),s=[{title:"Application",href:"settings"},{title:"SMTP",href:"settings.smtp"},{title:"Sécurité",href:"settings.security"},{title:"Pusher",href:"settings.pusher"},{title:"Moyen de paiement",href:"settings.payment"},{title:"Comptes réseaux sociaux",href:"settings.socials"}];return e.jsxs("div",{className:"w-full px-2 sm:px-4 dark:bg-gray-950",children:[e.jsx("div",{className:"flex flex-col sm:flex-row overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700",children:e.jsx("div",{className:"flex sm:flex-row whitespace-nowrap",children:s.map((t,a)=>e.jsx(o,{href:route(t.href),className:`
                                  flex-shrink-0
                                  px-3 sm:px-4 py-2
                                  text-sm sm:text-base font-medium
                                  transition-colors duration-200
                                  ${route().current()===t.href?"border-b-2 border-orange-600 text-orange-600 dark:text-orange-500":"text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}
                              `,children:t.title},a))})}),e.jsx("div",{className:"mt-5",children:r})]})}export{x as default};
