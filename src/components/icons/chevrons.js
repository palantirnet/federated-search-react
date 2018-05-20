/**
 * Defines react components from chevron svgs (see styleguide/src/includes/svg)
 * @todo consider using an svg loader package (i.e. https://www.npmjs.com/package/react-svg-loader) to import and return the svg elements directly vs duplicating markup
 */

import React from "react";

const DoubleChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.1 4.5c.4.4.5 1 0 1.6L12.3 10l3.7 3.9c.5.5.4 1.1 0 1.6-.4.4-1.2.4-1.6 0-.4-.4-4.5-4.7-4.5-4.7-.2-.2-.3-.5-.3-.8s.1-.6.3-.8c0 0 4.1-4.3 4.5-4.7.5-.4 1.2-.4 1.7 0z"/><path d="M10.1 4.5c.4.4.5 1 0 1.6L6.3 10l3.7 3.9c.5.5.4 1.1 0 1.6-.4.4-1.2.4-1.6 0-.4-.4-4.5-4.7-4.5-4.7-.2-.2-.3-.5-.3-.8s.1-.6.3-.8c0 0 4.1-4.3 4.5-4.7.5-.4 1.2-.4 1.7 0z"/></svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.452 4.516c.446.436.481 1.043 0 1.576L8.705 10l3.747 3.908c.481.533.446 1.141 0 1.574-.445.436-1.197.408-1.615 0-.418-.406-4.502-4.695-4.502-4.695a1.095 1.095 0 0 1 0-1.576s4.084-4.287 4.502-4.695c.418-.409 1.17-.436 1.615 0z"/></svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.163 4.516c.418.408 4.502 4.695 4.502 4.695a1.095 1.095 0 0 1 0 1.576s-4.084 4.289-4.502 4.695c-.418.408-1.17.436-1.615 0-.446-.434-.481-1.041 0-1.574L11.295 10 7.548 6.092c-.481-.533-.446-1.141 0-1.576.445-.436 1.197-.409 1.615 0z"/></svg>
);

const DoubleChevronRight = () =>  (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.6 4.5c.4.4 4.5 4.7 4.5 4.7.2.2.3.5.3.8s-.1.6-.3.8c0 0-4.1 4.3-4.5 4.7-.4.4-1.2.4-1.6 0-.4-.4-.5-1 0-1.6L7.7 10 3.9 6.1c-.4-.5-.4-1.1 0-1.6.5-.4 1.2-.4 1.7 0z"/><path d="M11.6 4.5c.4.4 4.5 4.7 4.5 4.7.2.2.3.5.3.8s-.1.6-.3.8c0 0-4.1 4.3-4.5 4.7-.4.4-1.2.4-1.6 0-.4-.4-.5-1 0-1.6l3.7-3.9-3.8-3.9c-.4-.5-.4-1.1 0-1.6.5-.4 1.2-.4 1.7 0z"/></svg>
);

export {DoubleChevronLeft, ChevronLeft, ChevronRight, DoubleChevronRight};
