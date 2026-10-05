(function(){
// Hosted static page. Open it as <page>#<k> where <k> is the secret from public.schwab_reauth_url().
// The secret is read from the hash, kept in a closure, and never written to the DOM, console, or any log.
var API='https://qdigexcouztravbfpwhb.supabase.co/functions/v1/schwab_reauth';
var k=(location.hash||'').slice(1);
var st=document.getElementById('status'),sub=document.getElementById('sub'),r=document.getElementById('r'),res=document.getElementById('result'),login=document.getElementById('login'),go=document.getElementById('go'),pasteBtn=document.getElementById('paste');
try{if(k&&history.replaceState)history.replaceState(null,'',location.pathname+location.search+location.hash);}catch(e){}
function api(o){return fetch(API+'?k='+encodeURIComponent(k),o).then(function(x){return x.json().then(function(j){j._http=x.status;return j;});});}
function setStatus(j){
  if(j&&j.ok===false){st.className='status bad';st.textContent=j.message||'Not allowed.';return;}
  var when=j.refresh_expires_at_et||'';
  if(j.expired){st.className='status bad';st.textContent='Schwab login: EXPIRED'+(when?' since '+when:'')+'.';sub.textContent='The desk has had no prices or option data since then. Log in below to resume.';}
  else{st.className='status ok';st.textContent='Schwab login: valid until '+when+'.';sub.textContent=(j.time_left?j.time_left+'. ':'')+'You can log in again early to extend it.';}
  if(j.auth_url){login.href=j.auth_url;login.className='btn';}
  else{sub.textContent='Cannot build the Schwab login link (app_key missing).';}
}
if(!k){st.className='status bad';st.textContent='Missing key.';sub.textContent='Open this page from the link in the EV Desk Telegram alert (it ends with #...). Ask the desk for schwab_reauth_url().';}
else api().then(setStatus).catch(function(e){st.className='status bad';st.textContent='Could not load status.';sub.textContent=String(e&&e.message||e)+'. Pull to refresh and try again.';});

var busy=false;
function submit(){
  if(busy)return;var v=r.value.trim();
  if(!v){res.className='bad';res.textContent='Nothing pasted yet. Tap Paste first.';return;}
  if(!/[?&]code=/.test(v)){res.className='bad';res.textContent='That does not look like the Schwab address. It must contain code=.';return;}
  busy=true;go.disabled=true;res.className='';res.textContent='Sending to Schwab...';
  api({method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({redirect_url:v})})
  .then(function(j){res.className=j.ok?'ok':'bad';res.textContent=j.message||(j.ok?'Done.':'Failed.');if(j.ok){r.value='';api().then(setStatus).catch(function(){});}})
  .catch(function(e){res.className='bad';res.textContent='Network error: '+String(e&&e.message||e)+'. Try Submit again.';})
  .then(function(){busy=false;go.disabled=false;});
}
function doPaste(){
  if(navigator.clipboard&&navigator.clipboard.readText){
    navigator.clipboard.readText().then(function(t){
      t=(t||'').trim();
      if(/[?&]code=/.test(t)){r.value=t;submit();}
      else{r.focus();res.className='bad';res.textContent=t?'Clipboard does not contain the Schwab address. Copy it from the blank page, then tap Paste again.':'Clipboard is empty. Long-press the box below and choose Paste.';}
    }).catch(function(){r.focus();res.className='';res.textContent='Long-press the box below and choose Paste, then tap Submit.';});
  } else {r.focus();res.className='';res.textContent='Long-press the box below and choose Paste, then tap Submit.';}
}
pasteBtn.onclick=doPaste;go.onclick=submit;
r.addEventListener('paste',function(){setTimeout(function(){if(/[?&]code=/.test(r.value))submit();},80)});
})();
