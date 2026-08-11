import React, { useState } from 'react';
import { Code, Terminal, Copy, Check, Sparkles } from 'lucide-react';

export const CodeEditor = ({ text = "I love you", minScale = 11, maxScale = 16, activeStep = 0, color = "#ffb6c1" }) => {
  const [activeTab, setActiveTab] = useState('python');
  const [copied, setCopied] = useState(false);

  const pythonCode = [
    { line: 1, type: 'imp', code: 'import turtle' },
    { line: 2, type: 'imp', code: 'import math' },
    { line: 3, type: 'blank', code: '' },
    { line: 4, type: 'init', code: 'screen = turtle.Screen()' },
    { line: 5, type: 'init', code: `screen.bgcolor("black")` },
    { line: 6, type: 'blank', code: '' },
    { line: 7, type: 'init', code: 't = turtle.Turtle()' },
    { line: 8, type: 'blank', code: '' },
    { line: 9, type: 'cfg', code: 't.speed(1)' },
    { line: 10, type: 'cfg', code: 't.hideturtle()' },
    { line: 11, type: 'cfg', code: 't.penup()' },
    { line: 12, type: 'cfg', code: `t.color("${color}")` },
    { line: 13, type: 'blank', code: '' },
    { line: 14, type: 'loop1', code: `for scale in range(${minScale}, ${maxScale + 1}):` },
    { line: 15, type: 'loop2', code: '    for i in range(120):' },
    { line: 16, type: 'math', code: '        angle = i * (math.pi * 2) / 120' },
    { line: 17, type: 'blank', code: '' },
    { line: 18, type: 'math', code: '        x = 16 * (math.sin(angle) ** 3) * scale' },
    { line: 19, type: 'math', code: '        y = (13 * math.cos(angle) - 5 *' },
    { line: 20, type: 'math', code: '             math.cos(2 * angle) - 2 * math.cos(3 *' },
    { line: 21, type: 'math', code: '             angle) - math.cos(4 * angle)) * scale' },
    { line: 22, type: 'blank', code: '' },
    { line: 23, type: 'write', code: '        t.goto(x, y)' },
    { line: 24, type: 'write', code: `        t.write("${text}", align="center",` },
    { line: 25, type: 'write', code: '                font=("Arial", 8, "bold"))' },
    { line: 26, type: 'blank', code: '' },
    { line: 27, type: 'end', code: 'turtle.done()' },
  ];

  const jsCode = [
    { line: 1, type: 'init', code: '// HTML5 Canvas Heart Generator' },
    { line: 2, type: 'init', code: 'const canvas = document.getElementById("heartCanvas");' },
    { line: 3, type: 'init', code: 'const ctx = canvas.getContext("2d");' },
    { line: 4, type: 'cfg', code: `ctx.fillStyle = "${color}";` },
    { line: 5, type: 'cfg', code: 'ctx.font = "bold 10px Arial";' },
    { line: 6, type: 'blank', code: '' },
    { line: 7, type: 'loop1', code: `for (let scale = ${minScale}; scale <= ${maxScale}; scale++) {` },
    { line: 8, type: 'loop2', code: '  for (let i = 0; i < 120; i++) {' },
    { line: 9, type: 'math', code: '    const angle = (i * Math.PI * 2) / 120;' },
    { line: 10, type: 'math', code: '    const x = 16 * Math.pow(Math.sin(angle), 3) * scale;' },
    { line: 11, type: 'math', code: '    const y = -(13 * Math.cos(angle) - 5 * Math.cos(2*angle)' },
    { line: 12, type: 'math', code: '               - 2 * Math.cos(3*angle) - Math.cos(4*angle)) * scale;' },
    { line: 13, type: 'write', code: `    ctx.fillText("${text}", centerX + x, centerY + y);` },
    { line: 14, type: 'loop2', code: '  }' },
    { line: 15, type: 'loop1', code: '}' },
  ];

  const currentCodeLines = activeTab === 'python' ? pythonCode : jsCode;

  // Determine active highlight line based on animation phase
  const getActiveLineIndex = () => {
    if (activeStep === 0) return -1;
    if (activeStep % 4 === 1) return 14; // loop line
    if (activeStep % 4 === 2) return 16; // math angle
    if (activeStep % 4 === 3) return 18; // math x/y
    return 23; // t.goto / write
  };

  const activeLine = getActiveLineIndex();

  const handleCopy = () => {
    const rawText = currentCodeLines.map(l => l.code).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedLine = (codeStr) => {
    if (!codeStr) return '';
    // Python syntax highlighting tokens
    if (codeStr.startsWith('import')) {
      const parts = codeStr.split(' ');
      return <><span className="syn-kw">{parts[0]}</span> <span className="syn-imp">{parts[1]}</span></>;
    }
    if (codeStr.includes('for ') || codeStr.includes('in range')) {
      return (
        <span dangerouslySetInnerHTML={{
          __html: codeStr
            .replace(/\b(for|in)\b/g, '<span class="syn-kw">$1</span>')
            .replace(/\b(range)\b/g, '<span class="syn-fn">$1</span>')
            .replace(/(\d+)/g, '<span class="syn-num">$1</span>')
        }} />
      );
    }
    if (codeStr.includes('t.write') || codeStr.includes('ctx.fillText')) {
      return (
        <span dangerouslySetInnerHTML={{
          __html: codeStr
            .replace(/"([^"]*)"/g, '<span class="syn-str">"$1"</span>')
            .replace(/t\.write|ctx\.fillText/g, '<span class="syn-fn">$&</span>')
        }} />
      );
    }
    return (
      <span dangerouslySetInnerHTML={{
        __html: codeStr
          .replace(/"([^"]*)"/g, '<span class="syn-str">"$1"</span>')
          .replace(/\b(math|turtle|screen|t|ctx|canvas)\b/g, '<span class="syn-var">$1</span>')
          .replace(/\b(sin|cos|pi|pow|Screen|Turtle)\b/g, '<span class="syn-fn">$1</span>')
          .replace(/(=|\+|\-|\*|\*\*|\/)/g, '<span class="syn-op">$1</span>')
      }} />
    );
  };

  return (
    <div className="code-editor-window">
      <div className="window-header">
        <div className="window-dots">
          <div className="dot dot-red"></div>
          <div className="dot dot-yellow"></div>
          <div className="dot dot-green"></div>
        </div>

        <div className="code-tabs">
          <button
            className={`tab-btn ${activeTab === 'python' ? 'active' : ''}`}
            onClick={() => setActiveTab('python')}
          >
            <Terminal size={14} />
            turtle_heart.py
          </button>
          <button
            className={`tab-btn ${activeTab === 'js' ? 'active' : ''}`}
            onClick={() => setActiveTab('js')}
          >
            <Code size={14} />
            canvas_heart.js
          </button>
        </div>

        <button className="icon-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
        </button>
      </div>

      <div className="code-container">
        {currentCodeLines.map((lineObj) => {
          const isActive = activeTab === 'python' && lineObj.line === activeLine;
          return (
            <div
              key={lineObj.line}
              className={`code-line ${isActive ? 'active-line' : ''}`}
            >
              <span className="line-num">{lineObj.line}</span>
              <span className="line-content">{renderFormattedLine(lineObj.code)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
