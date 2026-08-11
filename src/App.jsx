import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { HeartCanvas } from './components/HeartCanvas';
import { ControlPanel } from './components/ControlPanel';

export function App() {
  const [text, setText] = useState('I love you');
  const [minScale, setMinScale] = useState(11);
  const [maxScale, setMaxScale] = useState(16);
  const [color, setColor] = useState('#ffb6c1');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(11);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setResetKey((prev) => prev + 1);
    setIsPlaying(true);
  }, []);

  const handleStepChange = useCallback((stepCount) => {
    setActiveStep(stepCount);
  }, []);

  const handleFinished = useCallback(() => {
    // Optionally loop or pause when finished
  }, []);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="canvas-view-full">
          <HeartCanvas
            key={resetKey}
            text={text}
            minScale={minScale}
            maxScale={maxScale}
            color={color}
            fontFamily={fontFamily}
            fontSize={fontSize}
            speed={speed}
            isPlaying={isPlaying}
            onStepChange={handleStepChange}
            onFinished={handleFinished}
          />
        </div>
      </main>

      <ControlPanel
        text={text}
        setText={setText}
        color={color}
        setColor={setColor}
        speed={speed}
        setSpeed={setSpeed}
        minScale={minScale}
        setMinScale={setMinScale}
        maxScale={maxScale}
        setMaxScale={setMaxScale}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onReset={handleReset}
      />
    </div>
  );
}

export default App;
