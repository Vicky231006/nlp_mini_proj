import React from 'react';
import ReactMarkdown from 'react-markdown';

// Renders tutor (assistant) messages as formatted markdown. Raw HTML in the
// model output is NOT rendered (react-markdown escapes it without rehype-raw),
// so this is safe to use with untrusted model text.
const markdownComponents = {
  p: ({ children }) => (
    <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  h1: ({ children }) => (
    <p className="mb-1 mt-3 text-lg font-black first:mt-0">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="mb-1 mt-3 text-base font-black first:mt-0">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="mb-1 mt-2 text-sm font-black first:mt-0">{children}</p>
  ),
  h4: ({ children }) => (
    <p className="mb-1 mt-2 text-sm font-black first:mt-0">{children}</p>
  ),
  h5: ({ children }) => (
    <p className="mb-1 mt-2 text-sm font-black first:mt-0">{children}</p>
  ),
  h6: ({ children }) => (
    <p className="mb-1 mt-2 text-sm font-black first:mt-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-black">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-slate-300 pl-3 italic">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-left text-amber-50">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-800/10 px-1 py-0.5 font-mono text-[0.9em] font-bold">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-blue-700 underline"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-slate-300" />
};

function MessageMarkdown({ content }) {
  return <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>;
}

export default MessageMarkdown;
