/* QosTil AI — locally executed TF-IDF + multinomial logistic regression.
 * All numeric coefficients come directly from scripts/train.py; no external AI API.
 */
'use strict';
const NAMES={kk:'Kazakh',ru:'Russian',en:'English'};
const EXAMPLES=[
 'Құрметті оқушылар, tomorrow we have a science quiz, поэтому дайындалыңдар!',
 'Сәлем! Please upload your homework бүгін кешке, потом проверим.',
 'Ата-аналар, parent meeting болады on Friday, пожалуйста кешікпеңіздер.'
];
const app={model:null,vocab:null,target:'kk',results:[],input:'',active:true};
const $=id=>document.getElementById(id);
const wordRe=/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu;
const letterRe=/[\p{L}\p{M}]/u;
const kzLetters=/[әғқңөұүһі]/iu;
const latinLetters=/[a-z]/i;
function softmax(logits){const peak=Math.max(...logits),values=logits.map(x=>Math.exp(x-peak)),sum=values.reduce((a,b)=>a+b,0);return values.map(x=>x/sum)}
function getFeatures(word){
  let t=word.toLowerCase();const seen=new Map();
  for(let n=2;n<=4;n++){for(let i=0;i<=t.length-n;i++){const gram=t.slice(i,i+n);const idx=app.vocab.get(gram);if(idx!==undefined)seen.set(idx,(seen.get(idx)||0)+1)}}
  const weights=[];let normSq=0;
  for(const [idx,count] of seen){const value=count*app.model.idf[idx];normSq+=value*value;weights.push([idx,value])}
  const norm=Math.sqrt(normSq)||1;
  return weights.map(([idx,val])=>[idx,val/norm]);
}
function predict(word){
  const z=[...app.model.intercept];
  for(const [idx,value] of getFeatures(word)){for(let i=0;i<z.length;i++){z[i]+=app.model.coef[i][idx]*value}}
  const scores=softmax(z),best=scores.indexOf(Math.max(...scores));
  const sorted=[...scores].sort((a,b)=>b-a);
  return {word,language:app.model.classes[best],score:scores[best],margin:sorted[0]-sorted[1],scores,uncertain:sorted[0]<.63||sorted[0]-sorted[1]<.22};
}
function baseline(word){if(latinLetters.test(word))return 'en';if(kzLetters.test(word))return 'kk';return 'ru';}
function tokenize(s){return [...s.matchAll(wordRe)].map(m=>({...predict(m[0]),start:m.index,end:m.index+m[0].length,baseline:baseline(m[0])}));}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function analyze(){
  if(!app.model)return;const input=$('message').value.slice(0,2000);app.input=input;
  app.results=tokenize(input);let switches=0,previous=null;let targetCount=0;
  for(const t of app.results){if(previous!==null&&t.language!==previous)switches++;previous=t.language;if(t.language===app.target)targetCount++}
  const items=app.results.filter(x=>x.language!==app.target||x.uncertain);
  const total=app.results.length;
  $('coverage').textContent=total?`${Math.round(targetCount/total*100)}%`:'—';
  $('switches').textContent=String(switches);
  $('to-review').textContent=String(items.length);
  $('queue-count').textContent=`${items.length} ${items.length===1?'item':'items'}`;
  $('result-ready').textContent=total?'ANALYZED':'NO WORDS';
  $('result-ready').style.color='#19a077';
  const box=$('highlighted');box.innerHTML='';let last=0;
  for(const token of app.results){
    box.append(document.createTextNode(input.slice(last,token.start)));
    const node=document.createElement('span');node.className=`token ${token.language}${token.uncertain?' uncertain':''}`;
    const cls=app.model.classes;const scores=cls.map((k,i)=>`${NAMES[k]}: ${(token.scores[i]*100).toFixed(0)}%`).join(' · ');
    node.textContent=token.word;node.title=`${NAMES[token.language]} · ${scores}${token.uncertain?' · REVIEW RECOMMENDED':''}`;
    node.setAttribute('aria-label',`${token.word}, likely ${NAMES[token.language]}${token.uncertain?', review recommended':''}`);
    box.append(node);last=token.end;
  }
  box.append(document.createTextNode(input.slice(last)));
  if(!total)box.textContent='Type a message containing letters to analyze it.';
  const review=$('review-list');review.innerHTML='';
  if(!items.length){review.innerHTML='<div class="empty">No non-target or low-score words detected. Human review may still be helpful.</div>'}
  else for(const item of items.slice(0,35)){
    const el=document.createElement('div');el.className='review-item';
    const name=document.createElement('span');name.className='word';name.textContent=item.word;
    const meta=document.createElement('span');meta.className='tag';meta.textContent=NAMES[item.language];
    const reason=document.createElement('span');reason.className='reason';reason.textContent=item.uncertain?'CHECK':'TRANSLATE?';
    el.append(name,meta,reason);review.append(el);
  }
}
function setTarget(t){if(!NAMES[t])return;app.target=t;for(const btn of document.querySelectorAll('[data-target]')){const on=btn.dataset.target===t;btn.classList.toggle('selected',on);btn.setAttribute('aria-checked',String(on));}if(app.model)analyze()}
async function init(){
  $('message').addEventListener('input',()=>{$('char-count').textContent=$('message').value.length});
  $('message').dispatchEvent(new Event('input'));
  $('analyze').disabled=true;
  $('analyze').addEventListener('click',analyze);
  $('reset').addEventListener('click',()=>{$('message').value='';$('message').dispatchEvent(new Event('input'));analyze();$('message').focus()});
  for(const b of document.querySelectorAll('[data-target]'))b.addEventListener('click',()=>setTarget(b.dataset.target));
  for(const b of document.querySelectorAll('[data-example]'))b.addEventListener('click',()=>{$('message').value=EXAMPLES[+b.dataset.example];$('message').dispatchEvent(new Event('input'));analyze()});
  $('copy').addEventListener('click',async()=>{
    const list=app.results.map(t=>`${t.word} [${t.language}${t.uncertain?' — needs review':''}]`).join(' ');
    const output=`QosTil AI — message analysis\nTarget language: ${NAMES[app.target]}\nOriginal: ${app.input}\nLabels: ${list}\nPrototype; check results with a fluent speaker.`;
    try{await navigator.clipboard.writeText(output);$('copy').textContent='Copied to clipboard ✓';setTimeout(()=>{$('copy').innerHTML='Copy analysis summary <span>↗</span>'},1300)}catch(e){$('copy').textContent='Copy unavailable in this browser'}
  });
  try{
    const response=await fetch('./model.json',{cache:'default'});if(!response.ok)throw Error(`HTTP ${response.status}`);
    app.model=await response.json();app.vocab=new Map(app.model.feature_names.map((w,i)=>[w,i]));
    $('model-status').textContent='Model ready · on-device';$('status-dot').classList.add('ready');$('analyze').disabled=false;analyze();
  }catch(e){$('model-status').textContent='Model unavailable';$('result-ready').textContent='ERROR';$('highlighted').textContent='Model could not load. Serve the web/ folder with a local HTTP server (see README).';console.error(e)}
}
document.addEventListener('DOMContentLoaded',init);
// Expose only pure functions for parity tests; never transmit or store input text.
if(typeof module!=='undefined')module.exports={baseline,softmax};