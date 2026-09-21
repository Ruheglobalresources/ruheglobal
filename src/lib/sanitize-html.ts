// Minimal sanitizer for blog content coming out of the custom rich text
// editor. It only ever emits h2/h3/p/strong/em/a/br from document.execCommand,
// but this strips <script>/<style>/<iframe>, inline event handlers, and
// javascript: URLs as a second line of defense against anything pasted in.
// If the blog grows past a single admin/counselor authoring flow, swap this
// for a real allowlist sanitizer (e.g. isomorphic-dompurify).
export function sanitizeBlogHtml(html: string): string {
  return html
    .replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
}