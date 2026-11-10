/* Student login, separate from the existing Supabase reviewer admin panel.
   Netlify Identity legacy static-site widget; no build system or extra provider keys required.
   Authentication itself must be verified on the deployed Netlify domain. */
(() => {
  'use strict';
  const link = document.getElementById('eeAccountLink');
  const signIn = document.getElementById('eeLoginButton');
  const status = document.getElementById('eeAuthStatus');
  const login = document.getElementById('eeAccountLogin');
  const logout = document.getElementById('eeAccountLogout');
  const name = document.getElementById('eeAccountName');
  const email = document.getElementById('eeAccountEmail');
  const avatar = document.getElementById('eeAccountAvatar');
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ar';
  function render(user) {
    const active = Boolean(user);
    if (link) link.textContent = active ? (lang()==='en'?'My account':'حسابي') : (lang()==='en'?'Account':'الحساب');
    if (signIn) { signIn.hidden = active; signIn.textContent = lang()==='en'?'Sign in':'تسجيل Google'; }
    if (login) login.hidden = active;
    if (logout) logout.hidden = !active;
    if (name) name.textContent = user?.user_metadata?.full_name || user?.user_metadata?.name || (active ? (lang()==='en'?'Student account':'حساب الطالب') : '—');
    if (email) email.textContent = user?.email || '—';
    if (avatar) {
      const initial = (user?.user_metadata?.full_name || user?.email || '?').trim().charAt(0).toUpperCase();
      avatar.textContent = initial;
    }
    if (status) status.textContent = active ? (lang()==='en'?'Signed in. Your academic data is still stored on this device until cloud sync is enabled.':'تم تسجيل الدخول. بيانات أدواتك الأكاديمية ما زالت محفوظة على هذا الجهاز إلى أن نفعّل المزامنة السحابية.') : (lang()==='en'?'Sign in with Google to create your student account.':'سجّل بحساب Google لإنشاء حسابك الطلابي.');
  }
  function errorText(message) {
    if (status) status.textContent = message;
    else console.warn(message);
  }
  function boot() {
    const identity = window.netlifyIdentity;
    if (!identity) {
      errorText(lang()==='en'?'Sign-in service did not load. Check your internet connection.':'تعذر تحميل خدمة تسجيل الدخول. تأكد من اتصال الإنترنت.');
      return;
    }
    identity.on('init', render);
    identity.on('login', user => { render(user); identity.close(); });
    identity.on('logout', () => render(null));
    identity.on('error', err => { console.error('Identity:', err); errorText(lang()==='en'?'Login failed; please try again.':'تعذر تسجيل الدخول، حاول مرة ثانية.'); });
    // Register handlers before initialization; widget processes OAuth callbacks.
    identity.init({ locale: lang() });
    render(identity.currentUser());
    const open = () => identity.open('login');
    if (signIn) signIn.addEventListener('click', open);
    if (login) login.addEventListener('click', open);
    if (logout) logout.addEventListener('click', () => identity.logout());
    document.addEventListener('ee:languagechange', () => render(identity.currentUser()));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
