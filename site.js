'use strict';
const toggle=document.querySelector('.nav-toggle');
const menu=document.querySelector('.nav-links');
if(toggle&&menu){toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));menu.classList.toggle('open',!expanded)});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))}
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window&&!prefersReduced){const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('appeared');obs.unobserve(e.target)}})},{threshold:.07});document.querySelectorAll('.work-card,.arch-card,.impact-grid article,.performance-card,.message-demo').forEach(el=>{el.classList.add('reveal');obs.observe(el)})}