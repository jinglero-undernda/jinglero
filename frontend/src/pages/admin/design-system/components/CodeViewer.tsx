
interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeViewer({ code, language, title }: CodeViewerProps) {
  return (
    <div className="code-viewer">
      {title && <h4 className="code-viewer__title">{title}</h4>}
      <pre className="code-viewer__pre">
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  );
}

