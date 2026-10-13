/* ============================================================
   OPSALTECH — shared chrome injector (multi-page)
   Injects nav, mobile menu, backdrop, footer, contact modal,
   cookie banner, a11y widget and the legal modal into every page,
   so each page only ships its own <main> content.
   Runs as a classic script BEFORE script.js (which binds behavior).
   ============================================================ */
(() => {
  const B = document.body;
  const page = B.dataset.page || '';
  const cur = (p) => (page === p ? ' class="is-current" aria-current="page"' : '');
  const inDrop = ['webdesign', 'social-media', 'performance-marketing', 'content-creation'].includes(page);
  const mark = '<span class="nav__mark"></span>';
  const arrow = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const FORM_ACTION = 'https://formspree.io/f/mnjkrqrz';

  /* ---- reusable contact form (prefixed ids keep multiple instances valid) ---- */
  const contactForm = (p) => `
    <form class="cta__form js-contact-form" action="${FORM_ACTION}" method="POST" novalidate>
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0;width:0" />
      <input type="hidden" name="leistungen" class="js-svc" />
      <div class="field field--full">
        <input type="text" id="${p}name" name="name" required placeholder=" " autocomplete="name" data-cursor="hover" />
        <label for="${p}name">Dein Name</label>
      </div>
      <div class="field">
        <input type="email" id="${p}email" name="email" required placeholder=" " autocomplete="email" data-cursor="hover" />
        <label for="${p}email">E-Mail</label>
      </div>
      <div class="field">
        <input type="tel" id="${p}phone" name="phone" required placeholder=" " autocomplete="tel" data-cursor="hover" />
        <label for="${p}phone">Telefonnummer</label>
      </div>
      <div class="field--full form-svc">
        <span class="services__label">Woran bist du interessiert? <span class="services__hint">(Mehrfachauswahl möglich)</span></span>
        <div class="chips" role="group" aria-label="Gewünschte Leistungen">
          <button type="button" class="chip" data-service="Webdesign" aria-pressed="false">Webdesign</button>
          <button type="button" class="chip" data-service="Social Media" aria-pressed="false">Social Media</button>
          <button type="button" class="chip" data-service="Performance Marketing" aria-pressed="false">Performance Marketing</button>
          <button type="button" class="chip" data-service="Content Creation" aria-pressed="false">Content Creation</button>
          <button type="button" class="chip" data-service="Anderes" aria-pressed="false">Anderes</button>
        </div>
      </div>
      <div class="field field--full">
        <textarea id="${p}msg" name="message" rows="3" placeholder=" " data-cursor="hover"></textarea>
        <label for="${p}msg">Worum geht's? (optional)</label>
      </div>
      <label class="consent" for="${p}consent">
        <input type="checkbox" id="${p}consent" class="js-consent" required />
        <span class="consent__box" aria-hidden="true"></span>
        <span class="consent__txt">Ich habe die <a href="#" data-legal="datenschutz">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu.</span>
      </label>
      <button type="submit" class="btn btn--primary btn--xl magnetic" data-cursor="hover">
        <span class="btn__label">Anfrage senden</span>${arrow}
      </button>
      <p class="cta__success js-form-success" role="status">✦ Danke! Deine Anfrage ist raus — wir melden uns blitzschnell.</p>
      <p class="cta__error js-form-error" role="alert">⚠ Da ging leider etwas schief. Bitte versuch es erneut oder schreib direkt an <a href="mailto:info@opsaltech.com">info@opsaltech.com</a>.</p>
    </form>`;
  window.OPSAL_contactForm = contactForm; // so pages can embed an inline form with the same markup

  /* ---- top chrome ---- */
  const top = `
<a class="skip-link" href="#main">Zum Inhalt springen</a>
<div class="backdrop" aria-hidden="true"><div class="aurora aurora--1"></div><div class="aurora aurora--2"></div><div class="aurora aurora--3"></div><div class="grid-overlay"></div><div class="noise"></div></div>
<div class="cursor" aria-hidden="true"></div><div class="cursor-dot" aria-hidden="true"></div>
<div class="scroll-progress" aria-hidden="true"></div>
<header class="nav" id="nav">
  <a href="/" class="nav__brand" data-cursor="hover">${mark}OPSALTECH</a>
  <nav class="nav__links" aria-label="Hauptnavigation">
    <div class="nav__drop${inDrop ? ' is-current' : ''}">
      <a href="/#leistungen" class="nav__droptoggle" data-cursor="hover" aria-haspopup="true" aria-expanded="false">Leistungen <svg class="nav__chev" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <div class="nav__dropmenu" role="menu">
        <a href="/webdesign"${cur('webdesign')} role="menuitem" data-cursor="hover">Webdesign &amp; Development</a>
        <a href="/social-media"${cur('social-media')} role="menuitem" data-cursor="hover">Social Media Marketing</a>
        <a href="/performance-marketing"${cur('performance-marketing')} role="menuitem" data-cursor="hover">Performance Marketing</a>
        <a href="/content-creation"${cur('content-creation')} role="menuitem" data-cursor="hover">Content Creation</a>
      </div>
    </div>
    <a href="/#arbeiten" data-cursor="hover">Referenzen</a>
    <a href="/#prozess" data-cursor="hover">Prozess</a>
    <a href="/blog"${cur('blog')} data-cursor="hover">Blog</a>
  </nav>
  <button type="button" class="btn btn--nav magnetic" data-contact data-cursor="hover"><span>Kontakt</span>${arrow}</button>
  <button class="nav__burger" id="burger" aria-label="Menü öffnen" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <nav class="menu__links">
    <a href="/webdesign"${cur('webdesign')}><span class="menu__idx">01</span><span class="menu__txt">Webdesign</span></a>
    <a href="/social-media"${cur('social-media')}><span class="menu__idx">02</span><span class="menu__txt">Social Media</span></a>
    <a href="/performance-marketing"${cur('performance-marketing')}><span class="menu__idx">03</span><span class="menu__txt">Performance</span></a>
    <a href="/content-creation"${cur('content-creation')}><span class="menu__idx">04</span><span class="menu__txt">Content</span></a>
    <a href="/blog"${cur('blog')}><span class="menu__idx">05</span><span class="menu__txt">Blog</span></a>
  </nav>
  <button type="button" class="btn btn--primary btn--xl menu__cta" data-contact><span>Kontakt aufnehmen</span>${arrow}</button>
  <div class="menu__foot">
    <a href="mailto:info@opsaltech.com">info@opsaltech.com</a><span>·</span><a href="tel:+4917664262666">0176 64262666</a>
  </div>
</div>`;

  /* ---- bottom chrome ---- */
  const footer = `
<footer class="footer">
  <div class="footer__big" aria-hidden="true" data-parallax="0.16">OPSALTECH</div>
  <div class="footer__grid">
    <div class="footer__col">
      <span class="footer__brand">${mark}OPSALTECH</span>
      <p>Digitale Lösungen für modernes Wachstum. Webdesign, Social Media &amp; Content aus Willich.</p>
    </div>
    <div class="footer__col">
      <h4>Leistungen</h4>
      <a href="/webdesign" data-cursor="hover">Webdesign</a>
      <a href="/social-media" data-cursor="hover">Social Media</a>
      <a href="/performance-marketing" data-cursor="hover">Performance Marketing</a>
      <a href="/content-creation" data-cursor="hover">Content Creation</a>
    </div>
    <div class="footer__col">
      <h4>Mehr</h4>
      <a href="/blog" data-cursor="hover">Blog</a>
      <a href="/#arbeiten" data-cursor="hover">Referenzen</a>
      <a href="/kontakt" data-cursor="hover">Kontakt</a>
    </div>
    <div class="footer__col">
      <h4>Kontakt</h4>
      <a href="mailto:info@opsaltech.com" data-cursor="hover">info@opsaltech.com</a>
      <a href="tel:+4917664262666" data-cursor="hover">0176 64262666</a>
      <p style="margin-top:8px">Karlstraße 26a<br>47877 Willich</p>
    </div>
  </div>
  <div class="footer__bottom">
    <span>© 2026 OPSALTECH · Hoschmand/Springmeier GbR</span>
    <div class="footer__legal">
      <a href="#" data-legal="impressum" data-cursor="hover">Impressum</a>
      <a href="#" data-legal="datenschutz" data-cursor="hover">Datenschutz</a>
      <a href="#" data-cookie="open" data-cursor="hover">Cookie-Einstellungen</a>
    </div>
    <button class="footer__top magnetic" data-cursor="hover" id="toTop">Nach oben ↑</button>
  </div>
</footer>

<div class="cmodal" id="contactModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="cmodalTitle">
  <div class="cmodal__overlay" data-contact-close></div>
  <div class="cmodal__panel" role="document">
    <button class="cmodal__close" data-contact-close aria-label="Schließen"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <span class="eyebrow">Kontakt</span>
    <h3 id="cmodalTitle" class="cmodal__title">Lass uns etwas <span class="grad">Großes</span> bauen.</h3>
    <p class="cmodal__sub">Erzähl uns kurz von deinem Projekt — wir melden uns innerhalb von 24&nbsp;Stunden mit ersten Ideen.</p>
    ${contactForm('m')}
    <div class="cta__direct">
      <a href="mailto:info@opsaltech.com" data-cursor="hover">info@opsaltech.com</a><span>·</span><a href="tel:+4917664262666" data-cursor="hover">0176 64262666</a>
    </div>
  </div>
</div>

<div class="cookie" id="cookie" role="dialog" aria-label="Datenschutz-Einstellungen" aria-hidden="true">
  <div class="cookie__inner">
    <div class="cookie__main">
      <h3>🍪 Datenschutz &amp; Cookies</h3>
      <p>Wir verwenden nur <strong>technisch notwendige</strong> Speicherung, damit diese Website funktioniert. Optionale Cookies für Statistik oder Marketing setzen wir ausschließlich mit deiner Einwilligung. Details in der <a href="#" data-legal="datenschutz">Datenschutzerklärung</a>.</p>
    </div>
    <div class="cookie__settings" id="cookieSettings" hidden>
      <div class="cookie__cat"><div class="cookie__catinfo"><strong>Notwendig</strong><span>Für den Betrieb der Website erforderlich. Immer aktiv.</span></div><label class="cookie__switch cookie__switch--locked"><input type="checkbox" checked disabled aria-label="Notwendig – immer aktiv" /><span></span></label></div>
      <div class="cookie__cat"><div class="cookie__catinfo"><strong>Statistik</strong><span>Anonyme Reichweitenmessung. Derzeit nicht aktiv.</span></div><label class="cookie__switch"><input type="checkbox" data-cat="statistics" /><span></span></label></div>
      <div class="cookie__cat"><div class="cookie__catinfo"><strong>Marketing</strong><span>Personalisierte Inhalte &amp; Anzeigen. Derzeit nicht aktiv.</span></div><label class="cookie__switch"><input type="checkbox" data-cat="marketing" /><span></span></label></div>
    </div>
    <div class="cookie__actions">
      <button type="button" class="cookie__btn cookie__btn--ghost" data-cookie="settings">Einstellungen</button>
      <button type="button" class="cookie__btn cookie__btn--ghost" data-cookie="reject">Ablehnen</button>
      <button type="button" class="cookie__btn cookie__btn--primary" data-cookie="accept">Alle akzeptieren</button>
      <button type="button" class="cookie__btn cookie__btn--primary" data-cookie="save" hidden>Auswahl speichern</button>
    </div>
  </div>
</div>

<div class="a11y">
  <button class="a11y__toggle" id="a11yToggle" aria-expanded="false" aria-controls="a11yPanel" aria-label="Bedienungshilfe öffnen" title="Bedienungshilfe">
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M12 7v6m0 0l-4 5m4-5l4 5M5 8.5c2 1 4.5 1.5 7 1.5s5-.5 7-1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
  <div class="a11y__panel" id="a11yPanel" role="dialog" aria-label="Bedienungshilfe" aria-hidden="true">
    <div class="a11y__head"><h3>Bedienungshilfe</h3><button class="a11y__close" id="a11yClose" aria-label="Bedienungshilfe schließen"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>
    <div class="a11y__row"><span class="a11y__label">Textgröße</span><div class="a11y__stepper"><button data-a11y="font-dec" aria-label="Text verkleinern">A−</button><span class="a11y__val" id="a11yFontVal" aria-live="polite">100%</span><button data-a11y="font-inc" aria-label="Text vergrößern">A+</button></div></div>
    <button class="a11y__opt" data-a11y="contrast" aria-pressed="false"><span>Hoher Kontrast</span></button>
    <button class="a11y__opt" data-a11y="links" aria-pressed="false"><span>Links hervorheben</span></button>
    <button class="a11y__opt" data-a11y="readable" aria-pressed="false"><span>Bessere Lesbarkeit</span></button>
    <button class="a11y__opt" data-a11y="nomotion" aria-pressed="false"><span>Animationen stoppen</span></button>
    <button class="a11y__reset" data-a11y="reset">Alles zurücksetzen</button>
  </div>
</div>

<div class="legal" id="legal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="legalTitle">
  <div class="legal__overlay" data-legal-close></div>
  <div class="legal__panel" role="document">
    <div class="legal__head"><h3 id="legalTitle" class="legal__title">Impressum</h3><button class="legal__close" data-legal-close aria-label="Schließen"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>
    <div class="legal__body" id="legalBody" tabindex="0"></div>
  </div>
</div>
<div class="legal-src" id="legal-impressum" hidden>
  <h4>Angaben gemäß § 5 TMG</h4><p>Hoschmand/Springmeier GbR<br />Karlstraße 26a<br />47877 Willich</p>
  <h4>Vertreten durch</h4><p>Niclas Springmeier</p>
  <h4>Kontakt</h4><p>E-Mail: <a href="mailto:info@opsaltech.com">info@opsaltech.com</a><br />Telefon: <a href="tel:+4917664262666">0176 64262666</a></p>
  <h4>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h4><p>OPSALTECH</p>
  <h4>Umsatzsteuer-ID</h4><p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />DE363229767</p>
</div>
<div class="legal-src" id="legal-datenschutz" hidden>
  <h4>1. Datenschutz auf einen Blick</h4>
  <h5>Allgemeine Hinweise</h5><p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
  <h5>Datenerfassung auf dieser Website</h5>
  <p><strong>Wer ist verantwortlich für die Datenerfassung?</strong><br />Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten entnehmen Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle".</p>
  <p><strong>Wie erfassen wir Ihre Daten?</strong><br />Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z. B. über das Kontaktformular). Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst (vor allem technische Daten wie Browser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
  <p><strong>Welche Rechte haben Sie?</strong><br />Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen, sowie ein Beschwerderecht bei der zuständigen Aufsichtsbehörde.</p>
  <h4>2. Hosting</h4>
  <p>Wir hosten die Inhalte unserer Website bei Netlify (Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, USA). Beim Besuch erfasst Netlify Logfiles inkl. IP-Adressen. Grundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Datenübermittlung in die USA stützt sich auf das EU-U.S. Data Privacy Framework sowie Standardvertragsklauseln. Details: <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener">netlify.com/privacy</a>.</p>
  <h4>2a. Schriftarten</h4><p>Diese Website nutzt ausschließlich systemeigene Schriftarten (Helvetica/Arial). Es werden <strong>keine Web-Fonts von Drittanbietern</strong> (z. B. Google Fonts) geladen; Ihre IP-Adresse wird hierfür nicht an Dritte übermittelt.</p>
  <h4>3. Allgemeine Hinweise &amp; Pflichtinformationen</h4>
  <h5>Hinweis zur verantwortlichen Stelle</h5><p>Hoschmand/Springmeier GbR<br />Karlstraße 26a<br />47877 Willich<br />Telefon: 0176 64262666<br />E-Mail: info@opsaltech.com</p>
  <h5>Widerruf Ihrer Einwilligung</h5><p>Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt unberührt.</p>
  <h5>SSL- bzw. TLS-Verschlüsselung</h5><p>Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung.</p>
  <h4>4. Datenerfassung auf dieser Website</h4>
  <h5>Cookies &amp; lokaler Speicher</h5><p>Diese Website setzt <strong>keine Tracking- oder Marketing-Cookies</strong>. Lediglich für die Funktion „Bedienungshilfe" werden Ihre Einstellungen ausschließlich <strong>lokal in Ihrem Browser (localStorage)</strong> gespeichert; diese verlassen Ihr Endgerät nicht.</p>
  <h5>Kontaktformular</h5><p>Für den Versand des Kontaktformulars nutzen wir <strong>Formspree</strong> (Formspree, Inc., 2093 Philadelphia Pike #1131, Claymont, DE 19703, USA). Beim Absenden werden Ihre Angaben (Name, E-Mail, gewünschte Leistungen, Nachricht) an Formspree übermittelt, dort verarbeitet und als E-Mail an uns weitergeleitet. Grundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sowie Art. 6 Abs. 1 lit. b DSGVO. Die Übermittlung in die USA stützt sich auf das EU-U.S. Data Privacy Framework bzw. Standardvertragsklauseln. Details: <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener">formspree.io/legal/privacy-policy</a>. Ihre Einwilligung können Sie jederzeit widerrufen.</p>
</div>`;

  B.insertAdjacentHTML('afterbegin', top);
  B.insertAdjacentHTML('beforeend', footer);
})();
