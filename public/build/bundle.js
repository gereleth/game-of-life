var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function i(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function r(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n||null)}function s(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function a(){return f(" ")}function h(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function d(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function g(t,e){e=""+e,t.data!==e&&(t.data=e)}function p(t,e){(null!=e||t.value)&&(t.value=e)}let m;function v(t){m=t}function w(t){(function(){if(!m)throw new Error("Function called outside component initialization");return m})().$$.on_mount.push(t)}const y=[],b=[],$=[],C=[],k=Promise.resolve();let M=!1;function S(t){$.push(t)}let x=!1;const _=new Set;function N(){if(!x){x=!0;do{for(let t=0;t<y.length;t+=1){const e=y[t];v(e),Y(e.$$)}for(y.length=0;b.length;)b.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];_.has(e)||(_.add(e),e())}$.length=0}while(y.length);for(;C.length;)C.pop()();M=!1,x=!1,_.clear()}}function Y(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(S)}}const T=new Set;function X(t,e){-1===t.$$.dirty[0]&&(y.push(t),M||(M=!0,k.then(N)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function A(l,r,c,u,f,a,h=[-1]){const d=m;v(l);const g=r.props||{},p=l.$$={fragment:null,ctx:null,props:a,update:t,not_equal:f,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:n(),dirty:h};let w=!1;if(p.ctx=c?c(l,g,(t,e,...n)=>{const o=n.length?n[0]:e;return p.ctx&&f(p.ctx[t],p.ctx[t]=o)&&(p.bound[t]&&p.bound[t](o),w&&X(l,t)),e}):[],p.update(),w=!0,o(p.before_update),p.fragment=!!u&&u(p.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);p.fragment&&p.fragment.l(t),t.forEach(s)}else p.fragment&&p.fragment.c();r.intro&&((y=l.$$.fragment)&&y.i&&(T.delete(y),y.i(b))),function(t,n,l){const{fragment:r,on_mount:c,on_destroy:s,after_update:u}=t.$$;r&&r.m(n,l),S(()=>{const n=c.map(e).filter(i);s?s.push(...n):o(n),t.$$.on_mount=[]}),u.forEach(S)}(l,r.target,r.anchor),N()}var y,b;v(d)}const E=new function(){let t=this;t.livingSet=new Set,t.numNeighbors=new Map;const e=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];this.stringify=function(t){return t.r+";"+t.c},this.parse=function(t){const[e,n]=t.split(";");return{r:parseInt(e,10),c:parseInt(n,10)}},this.isCellAlive=function(e){return t.livingSet.has(this.stringify(e))},this.clear=function(){t.livingSet=new Set,t.numNeighbors=new Map},this.update=function(n,o){let i,l,r,c,s,u,f;for(let o of n)if(u=this.stringify(o),!t.livingSet.has(u))for([i,l]of(t.livingSet.add(u),t.numNeighbors.has(u)||t.numNeighbors.set(u,0),e))r=o.r+i,c=o.c+l,u=this.stringify({r:r,c:c}),t.numNeighbors.has(u)?t.numNeighbors.set(u,t.numNeighbors.get(u)+1):t.numNeighbors.set(u,1);for(let n of o)if(f=t.livingSet.delete(this.stringify(n)),f)for([i,l]of e)r=n.r+i,c=n.c+l,u=this.stringify({r:r,c:c}),s=t.numNeighbors.get(u),1==s&!t.livingSet.has(u)?t.numNeighbors.delete(u):t.numNeighbors.set(u,s-1)},this.step=function(){let e=[],n=[];for(let[o,i]of t.numNeighbors.entries())t.livingSet.has(o)?i<2|i>3&&n.push(this.parse(o)):3==i&&e.push(this.parse(o));return[e,n]}};function R(t){let e;return{c(){e=u("ul"),e.innerHTML='<li><a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway&#39;s Game of Life</a>.</li> \n        <li>Click or touch and drag to draw shapes</li> \n        <li>Press Run to see them evolve</li> \n        <li>Use W,A,S,D or arrows to move around, mouse wheel to zoom</li> \n        <li>Or touch with two fingers to pan and zoom</li>'},m(t,n){c(t,e,n)},d(t){t&&s(e)}}}function z(e){let n,l,m,v,w,y,b,$,C,k,M,S,x,_,N,Y,T,X,A,E,z,D,L,I,O,P,q,B,j,G,F,H,U,W,J,K,Q,V,Z=e[4]?"Stop":"Run",tt=e[5]&&R();return{c(){n=u("div"),l=u("div"),m=u("button"),m.textContent="?",v=a(),w=u("button"),w.textContent="Clear",y=a(),b=u("button"),$=f("Step"),C=a(),k=u("button"),M=f(Z),S=a(),x=u("div"),_=u("label"),_.textContent="Speed",N=a(),Y=u("input"),T=a(),X=u("div"),A=u("div"),E=f("cells:"),z=u("br"),D=f(e[6]),L=a(),I=u("div"),O=f("step:"),P=u("br"),q=f(e[1]),B=f(" ms"),j=a(),G=u("div"),F=f("draw:"),H=u("br"),U=f(e[2]),W=f(" ms"),J=a(),tt&&tt.c(),K=a(),Q=u("canvas"),d(m,"type","button"),d(m,"name","help"),d(m,"title","Show help"),d(m,"class","svelte-hgu8tl"),d(w,"title","Clear all cells from grid"),d(w,"class","svelte-hgu8tl"),b.disabled=e[4],d(b,"class","svelte-hgu8tl"),d(k,"class","svelte-hgu8tl"),d(l,"class","row svelte-hgu8tl"),d(_,"for","speed"),d(Y,"id","speed"),d(Y,"type","range"),d(Y,"min","5"),d(Y,"max","500"),d(Y,"step","1"),d(x,"class","row svelte-hgu8tl"),d(A,"class","svelte-hgu8tl"),d(I,"class","svelte-hgu8tl"),d(G,"class","svelte-hgu8tl"),d(X,"class","row svelte-hgu8tl"),d(n,"class","controls svelte-hgu8tl"),d(Q,"id","gridCanvas"),d(Q,"class","gridCanvas svelte-hgu8tl")},m(t,s,u){c(t,n,s),r(n,l),r(l,m),r(l,v),r(l,w),r(l,y),r(l,b),r(b,$),r(l,C),r(l,k),r(k,M),r(n,S),r(n,x),r(x,_),r(x,N),r(x,Y),p(Y,e[3]),r(n,T),r(n,X),r(X,A),r(A,E),r(A,z),r(A,D),r(X,L),r(X,I),r(I,O),r(I,P),r(I,q),r(I,B),r(X,j),r(X,G),r(G,F),r(G,H),r(G,U),r(G,W),r(n,J),tt&&tt.m(n,null),c(t,K,s),c(t,Q,s),e[49](Q),u&&o(V),V=[h(window,"keydown",e[8]),h(window,"keyup",e[9]),h(window,"resize",e[20]),h(m,"click",e[47]),h(w,"click",e[17]),h(b,"click",e[16]),h(k,"click",(function(){i(e[4]?e[19]:e[18])&&(e[4]?e[19]:e[18]).apply(this,arguments)})),h(Y,"change",e[48]),h(Y,"input",e[48]),h(Q,"mouseup",e[12]),h(Q,"mousedown",e[10]),h(Q,"mousemove",e[11]),h(Q,"wheel",e[7]),h(Q,"touchstart",e[13]),h(Q,"touchmove",e[14]),h(Q,"touchend",e[15]),h(Q,"touchcancel",e[15])]},p(t,o){e=t,16&o[0]&&(b.disabled=e[4]),16&o[0]&&Z!==(Z=e[4]?"Stop":"Run")&&g(M,Z),8&o[0]&&p(Y,e[3]),64&o[0]&&g(D,e[6]),2&o[0]&&g(q,e[1]),4&o[0]&&g(U,e[2]),e[5]?tt||(tt=R(),tt.c(),tt.m(n,null)):tt&&(tt.d(1),tt=null)},i:t,o:t,d(t){t&&s(n),tt&&tt.d(),t&&s(K),t&&s(Q),e[49](null),o(V)}}}function D(t,e){return{r:Math.floor(e),c:Math.floor(t)}}function L(t,e){const n=[];if(e>t)for(let o=Math.ceil(t);o<e;o++)n.push(o);else for(let o=Math.floor(t);o>e;o--)n.push(o);return n}function I(t,e,n,o){const i=n-t,l=o-e;let r,c,s=[];for(r of L(t,n))c=e+l*(r-t)/i,s.push(D(r-1,c)),s.push(D(r,c));for(c of L(e,o))r=t+i*(c-e)/l,s.push(D(r,c-1)),s.push(D(r,c));return s}function O(t,e,n){let o,i,l,r,c,s=25,u=.5,f=.5,a=0,h=0,d=10,g=!1,p=!1,m=!0,v=!1,y=0;function $(){i.clearRect(0,0,o.width,o.height),i.fillStyle="black",i.fillRect(0,0,o.width,o.height)}function C(){if(s>=10){const e=s*(u-Math.floor(u)),n=o.width/2-e,l=n-s*Math.floor(n/s),r=s*(f-Math.floor(f)),c=o.height/2-r,a=c-s*Math.floor(c/s);let h;i.strokeStyle="#555",i.beginPath();for(var t=0;t<Math.ceil(o.height/s);t++)h=Math.floor(a+t*s)+.5,i.moveTo(0,h),i.lineTo(o.width,h);for(t=0;t<Math.ceil(o.width/s);t++)h=Math.floor(l+t*s)+.5,i.moveTo(h,0),i.lineTo(h,o.height);i.stroke(),i.closePath()}}function k(){let t;for(let e of E.livingSet)t=E.parse(e),A(t,"#2bb")}function M(t){$(),C(),k()}let S=new Set;function x(t){const e=o.getBoundingClientRect();return[t.clientX-e.left,t.clientY-e.top]}function _(t){const[e,n]=x(t);return N(e,n)}function N(t,e){return[u+(t-1-o.width/2)/s,f+(e-1-o.height/2)/s]}function Y(t){return{x:Math.floor(o.width/2+1+(t.c-u)*s),y:Math.floor(o.height/2+1+(t.r-f)*s)}}let T=[],X=0;function A(t,e){i.fillStyle=e;const n=Y(t);i.fillRect(n.x,n.y,s-(s<=2?0:1),s-(s<=2?0:1))}function R(t,e){let o=performance.now();0==t.length&0===e.length&&O(),E.update(t,e);for(let e of t)A(e,"#2bb");for(let t of e)A(t,"black");n(2,h=performance.now()-o),n(6,y=E.livingSet.size)}function z(){let t,e,o=performance.now();[t,e]=E.step(),n(1,a=performance.now()-o),R(t,e)}function L(){g||(l=setInterval(()=>z(),1e3/d),n(4,g=!0))}function O(){g&&(clearInterval(l),n(4,g=!1))}function P(t){g&&(O(),L())}async function q(){n(0,o.width=10,o),n(0,o.height=10,o);const t=o.parentNode.getBoundingClientRect();n(0,o.width=t.width,o),n(0,o.height=t.height,o),M()}w(async()=>{i=o.getContext("2d"),setTimeout(q,42)});return t.$$.update=()=>{2097153&t.$$.dirty[0]&&o&&M(),8&t.$$.dirty[0]&&P()},[o,a,h,d,g,v,y,function(t){t.preventDefault();const e=t.deltaY>0;let i=Math.floor(5*Math.abs(t.deltaY)*s/100);i=Math.max(i,1);const l=Math.min(Math.max(1,s+(e?-1:1)*i),200);let[r,c]=x(t);r-=o.width/2,c-=o.height/2,u=u+r/s-r/l,f=f+c/s-c/l,u=Math.round(2*u)/2,f=Math.round(2*f)/2,n(21,s=l)},function(t){87===t.keyCode|38===t.keyCode?S.add("up"):83===t.keyCode|40===t.keyCode?S.add("down"):65===t.keyCode|37===t.keyCode?S.add("left"):68===t.keyCode|39===t.keyCode&&S.add("right");const e=20/s,n=(S.has("right")?e:0)-(S.has("left")?e:0),o=(S.has("down")?e:0)-(S.has("up")?e:0);if(0!==n|0!==o){if(p){const t=I(r,c,r+n,c+o);t.length>0&&(m?R(t,[]):R([],t)),r+=n,c+=o}u+=n,f+=o,M()}},function(t){87===t.keyCode|38===t.keyCode?S.delete("up"):83===t.keyCode|40===t.keyCode?S.delete("down"):65===t.keyCode|37===t.keyCode?S.delete("left"):68===t.keyCode|39===t.keyCode&&S.delete("right")},function(t){const[e,n]=_(t),o=D(e,n);m=!E.isCellAlive(o),m?R([o],[]):R([],[o]),p=!0,r=e,c=n},function(t){if(p){const[e,n]=_(t),o=I(r,c,e,n);o.length>0&&(m?R(o,[]):R([],o)),r=e,c=n}},function(t){const[e,n]=_(t),o=D(e,n);m?R([o],[]):R([],[o]),p=!1},function(t){t.preventDefault();for(let e of t.changedTouches)T.push({id:e.identifier,clientX:e.clientX,clientY:e.clientY});if(X=performance.now(),1==T.length){const[t,e]=_(T[0]),n=D(t,e);m=!E.isCellAlive(n),p=!0}else T.length>1&&(p=!1)},function(t){t.preventDefault();let e=performance.now();if(e-X>=50&&1==T.length&&p){const n=t.changedTouches[0],[o,i]=_(T[0]),[l,r]=_(n),c=I(l,r,o,i);c.length>0&&(m?R(c,[]):R([],c)),T=[{id:n.identifier,clientX:n.clientX,clientY:n.clientY}],X=e}else if(e-X>=200&&2==T.length){const e=T.map(t=>t.id);let o,i=[...T];for(let n of t.changedTouches)o=e.indexOf(n.identifier),i[o]={id:n.identifier,clientX:n.clientX,clientY:n.clientY};const l=Math.sqrt((T[0].clientX-T[1].clientX)**2+(T[0].clientY-T[1].clientY)**2),r=Math.sqrt((i[0].clientX-i[1].clientX)**2+(i[0].clientY-i[1].clientY)**2),c=Math.max(1,Math.round(r*s/l)),[a,h]=_(T[0]),[d,g]=_(T[1]);n(21,s=c);const[p,m]=_(i[0]),[v,w]=_(i[1]);u-=.5*(p-a+v-d),f-=.5*(m-h+w-g),M(),T=i}},function(t){if(t.preventDefault(),p&&1===T.length){const[e,n]=_(t.changedTouches[0]),o=D(e,n);m?R([o],[]):R([],[o]),p=!1}for(let e of t.changedTouches)T=T.filter(t=>t.id!==e.identifier);X=performance.now()},z,function(){E.clear(),M(),n(6,y=E.livingSet.size)},L,O,q,s,u,f,i,l,p,m,r,c,T,X,void 0,void 0,$,C,k,M,S,x,_,N,function(t,e){const[n,o]=N(t,e);return D(n,o)},Y,A,R,P,()=>n(5,v=!v),function(){var t;t=this.value,d=""===t?void 0:+t,n(3,d)},function(t){b[t?"unshift":"push"](()=>{n(0,o=t)})}]}return new class extends class{$destroy(){!function(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}{constructor(t){super(),A(this,t,O,z,l,{},[-1,-1])}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map