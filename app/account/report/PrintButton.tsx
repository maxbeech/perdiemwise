"use client";

// Triggers the browser's native print dialog, from which the user chooses
// "Save as PDF". Zero dependencies, pixel-accurate to the on-screen document,
// and the print stylesheet strips the site chrome.
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-[15px] font-medium text-white transition hover:bg-accent-dark"
    >
      Download / Print PDF
    </button>
  );
}
