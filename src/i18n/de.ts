import type { ToolContent } from './types';

// Deutsch. Keine Wort-für-Wort-Übersetzung, sondern Transkreation auf Basis der
// Begriffe und Wendungen, die deutsche HEIC-Konverter tatsächlich verwenden.
// Keine Werbefloskeln (einfach / schnell / kinderleicht / perfekt) — Datenschutz
// wird strukturell begründet, nicht versprochen (BRAND-OPERATING-MODEL /
// I18N-SEO-GUIDELINE). Register: informelles „du“, wie bei kostenlosen Browser-Tools üblich.

export const de: ToolContent = {
  htmlLang: 'de',

  meta: {
    title: 'HEIC in JPG umwandeln — im Browser, ohne Upload | runlocally',
    description:
      'HEIC- und HEIF-Fotos (iPhone, iPad) in JPG oder PNG umwandeln. Die Umwandlung läuft in deinem Browser, nichts wird hochgeladen. Open Source, funktioniert offline.',
    ogTitle: 'HEIC in JPG umwandeln — im Browser, ohne Upload',
    ogDescription:
      'HEIC/HEIF im Browser in JPG oder PNG umwandeln. Nichts wird hochgeladen. Open Source, offline nutzbar.',
  },

  hero: {
    h1: 'HEIC in JPG umwandeln',
    tagline:
      'iPhone- und iPad-Fotos im HEIC-/HEIF-Format im Browser in JPG oder PNG umwandeln. Nichts wird hochgeladen.',
  },

  intro: {
    h2: 'HEIC in JPG umwandeln — direkt im Browser',
    paras: [
      'Dieses Tool wandelt HEIC- und HEIF-Fotos – das Format von iPhone und iPad – in JPG oder PNG um. Windows-PCs, Android-Geräte und viele Websites können HEIC nicht direkt öffnen, deshalb ist die Umwandlung in ein verbreitetes Format oft nötig.',
      'Die Dekodierung läuft per WebAssembly im Browser. So funktioniert sie auch dort, wo der Browser HEIC nicht nativ unterstützt (Chrome, Edge und Firefox unter Windows und Android).',
    ],
  },

  privacy: {
    h2: 'Warum deine Dateien auf dem Gerät bleiben',
    lead: 'Datenschutz ist hier strukturell, kein Versprechen. Es gibt keinen Upload-Schritt, weil es keinen Server gibt, zu dem etwas hochgeladen werden könnte:',
    points: [
      'Die Umwandlung läuft vollständig in deinem Browser.',
      'Die Seite wird als statische Dateien ausgeliefert und sendet keine Anfrage mit deinen Bilddaten.',
      'Der Quellcode ist offen und kann von allen eingesehen werden (MIT).',
      'Die Seite funktioniert offline – was nur möglich ist, weil nichts das Gerät verlässt.',
    ],
    note: 'Wenn du es selbst prüfen willst, öffne beim Umwandeln das Netzwerk-Panel deines Browsers – keine Anfrage trägt deine Datei.',
    sourceLinkText: 'Quellcode ansehen.',
  },

  howto: {
    h2: 'So funktioniert es',
    steps: [
      {
        h3: 'Dateien auswählen',
        p: 'Klicke, um HEIC-/HEIF-Dateien auszuwählen, oder ziehe sie irgendwo auf die Seite. Mehrere Dateien auf einmal sind möglich.',
      },
      {
        h3: 'Einstellungen anpassen (optional)',
        p: 'Wähle JPG oder PNG, stelle die JPG-Qualität ein oder ändere die Größe. Die Voreinstellungen liefern gute Ergebnisse.',
      },
      {
        h3: 'Herunterladen',
        p: 'Jede Datei wird nach der Umwandlung heruntergeladen; mehrere lassen sich als ZIP herunterladen.',
      },
    ],
  },

  faqHeading: 'Häufige Fragen',
  faq: [
    {
      q: 'Werden meine Fotos irgendwohin hochgeladen?',
      a: 'Nein. Die Umwandlung läuft vollständig in deinem Browser. Es gibt keine Serverkomponente, also gibt es für deine Dateien keinen Weg vom Gerät. Der Quellcode ist offen und du kannst das im Netzwerk-Panel deines Browsers nachprüfen.',
    },
    {
      q: 'Was ist eine HEIC-Datei?',
      a: 'HEIC (High Efficiency Image Container) ist das Bildformat, das iPhone und iPad seit iOS 11 standardmäßig verwenden. Es speichert Fotos kleiner als JPEG, aber Windows sowie viele Android-Geräte und Websites können es nicht direkt öffnen – deshalb ist die Umwandlung in JPG oder PNG oft nötig.',
    },
    {
      q: 'Kann ich HEIC unter Windows in JPG umwandeln?',
      a: 'Ja. Die Dekodierung erfolgt per WebAssembly (libheif), daher funktioniert sie in Chrome, Edge und Firefox unter Windows, obwohl diese Browser HEIC nicht nativ öffnen können.',
    },
    {
      q: 'Geht bei der Umwandlung Qualität verloren?',
      a: 'Die JPG-Ausgabe nutzt eine einstellbare Qualität (Standard 92 %), die bei den meisten Fotos optisch nah am Original ist. Die PNG-Ausgabe wird verlustfrei aus dem dekodierten Bild erzeugt.',
    },
    {
      q: 'Funktioniert es offline?',
      a: 'Ja. Das Tool ist eine PWA. Nach dem ersten Besuch wird es zwischengespeichert, sodass die Umwandlung ohne Netzwerkverbindung funktioniert. Du kannst es auch zum Startbildschirm hinzufügen.',
    },
    {
      q: 'Gibt es ein Limit für Dateigröße oder Anzahl?',
      a: 'Es gibt kein festes Limit. Da alles im Browser läuft, hängt die praktische Grenze vom Arbeitsspeicher deines Geräts ab. Sehr große Bilder können langsamer sein oder müssen verkleinert werden.',
    },
  ],

  footer: {
    openSourceLabel: 'Open Source (MIT)',
    partOf: 'Teil von',
    brandTail: '— kleine Tools, die lokal auf deinem Gerät laufen.',
    colophon:
      'Erstellt und gepflegt von Geppetto. Ein Teil des Codes entsteht mit KI-Unterstützung; Prüfung und Entscheidungen liegen beim Maintainer.',
    securityText: 'Sicherheit',
  },
};
