import{r as n}from"./vendor-react-core-DwYS7WTl.js";import{c as u}from"./vendor--tanstack-table-core-5X0CgdHs.js";/**
   * react-table
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   */function S(t,e){return t?f(t)?n.createElement(t,e):t:null}function f(t){return l(t)||typeof t=="function"||i(t)}function l(t){return typeof t=="function"&&(()=>{const e=Object.getPrototypeOf(t);return e.prototype&&e.prototype.isReactComponent})()}function i(t){return typeof t=="object"&&typeof t.$$typeof=="symbol"&&["react.memo","react.forward_ref"].includes(t.$$typeof.description)}function b(t){const e={state:{},onStateChange:()=>{},renderFallbackValue:null,...t},[r]=n.useState(()=>({current:u(e)})),[o,s]=n.useState(()=>r.current.initialState);return r.current.setOptions(c=>({...c,...t,state:{...o,...t.state},onStateChange:a=>{s(a),t.onStateChange==null||t.onStateChange(a)}})),r.current}export{S as f,b as u};
