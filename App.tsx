import React, { useState, useMemo, useEffect } from 'react';
import { ComplexList } from './components/ComplexList';
import { BodeChart } from './components/BodeChart';
import { PhaseChart } from './components/PhaseChart';
import { PoleZeroMap } from './components/PoleZeroMap';
import { analyzeSystem } from './services/geminiService';
import { generateBodeData, generatePhaseData, findPolynomialRoots } from './utils/mathUtils';
import { SystemState, ComplexNumber } from './types';
import { Activity, Cpu, Play, Loader2, Sparkles, RefreshCcw, Settings2, Calculator, MousePointerClick, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type InputMode = 'interactive' | 'transferFunction';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('interactive');
  
  // Interactive Mode State
  const [poles, setPoles] = useState<ComplexNumber[]>([
    { id: 'p1', real: -1, imag: 10 },
    { id: 'p2', real: -1, imag: -10 }
  ]);
  const [zeros, setZeros] = useState<ComplexNumber[]>([]);
  const [gain, setGain] = useState<number>(1);
  
  // Transfer Function Mode State (Text inputs)
  const [numCoeffs, setNumCoeffs] = useState<string>("1"); // e.g., "1 0" for s
  const [denCoeffs, setDenCoeffs] = useState<string>("1 2 101"); // e.g. s^2 + 2s + 101
  const [tfError, setTfError] = useState<string>("");

  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'pole' | 'zero' | null>(null);

  // Find the selected object
  const selectedItem = useMemo(() => {
    if (!selectedId || !selectedType) return null;
    const list = selectedType === 'pole' ? poles : zeros;
    return list.find(item => item.id === selectedId) || null;
  }, [selectedId, selectedType, poles, zeros]);

  // Memoize chart data generation
  const bodeData = useMemo(() => {
    return generateBodeData({ poles, zeros, gain });
  }, [poles, zeros, gain]);

  const phaseData = useMemo(() => {
    return generatePhaseData({ poles, zeros, gain });
  }, [poles, zeros, gain]);

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      setAnalysis("⚠️ API Key not found. Cannot perform AI analysis.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysis("");
    
    try {
      const result = await analyzeSystem({ poles, zeros, gain });
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error analyzing system.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelect = (id: string, type: 'pole' | 'zero') => {
    // Selection only works in interactive mode or for viewing in TF mode
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    } else {
      setSelectedId(id);
      setSelectedType(type);
    }
  };

  const updateSelected = (field: 'real' | 'imag', value: number) => {
    if (!selectedId || !selectedType) return;
    if (inputMode === 'transferFunction') return; // Read-only in TF mode

    const updater = selectedType === 'pole' ? setPoles : setZeros;
    
    updater(prev => prev.map(item => {
      if (item.id === selectedId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleTransferFunctionSubmit = () => {
    setTfError("");
    try {
      // Parse inputs
      const parse = (str: string) => 
        str.trim().split(/\s+/).map(s => {
          const num = parseFloat(s);
          if (isNaN(num)) throw new Error(`Invalid coefficient: "${s}"`);
          return num;
        });

      const num = parse(numCoeffs);
      const den = parse(denCoeffs);

      if (num.length === 0 || den.length === 0) throw new Error("Coefficients cannot be empty");

      // Calculate roots
      const newZeros = findPolynomialRoots(num);
      const newPoles = findPolynomialRoots(den);

      // Calculate Gain K based on leading coefficients
      // H(s) = (b0*s^m + ...) / (a0*s^n + ...)
      // factored: H(s) = (b0/a0) * (s-z)/(s-p)
      const leadingNum = num.find(n => n !== 0) || 0;
      const leadingDen = den.find(n => n !== 0) || 1;
      const newGain = leadingNum / leadingDen;

      setZeros(newZeros);
      setPoles(newPoles);
      setGain(newGain);
      setSelectedId(null);
    } catch (err: any) {
      setTfError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 h-auto md:h-screen overflow-y-auto flex flex-col z-10 shadow-lg md:shadow-none">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <Activity className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">PoleZero<span className="font-normal text-slate-500">Plotter</span></h1>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
             <button
                onClick={() => setInputMode('interactive')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${inputMode === 'interactive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <MousePointerClick size={14} /> Interactive
             </button>
             <button
                onClick={() => setInputMode('transferFunction')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${inputMode === 'transferFunction' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Calculator size={14} /> System Function
             </button>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          
          {inputMode === 'interactive' ? (
            <>
              {/* Interactive Mode Controls */}
              {selectedItem && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center justify-between mb-3 border-b border-indigo-100 pb-2">
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                      <Settings2 size={14} /> 
                      Edit Selected {selectedType === 'pole' ? 'Pole' : 'Zero'}
                    </span>
                    <span className="font-mono text-xs text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                      {selectedItem.real.toFixed(2)} {selectedItem.imag >= 0 ? '+' : ''}{selectedItem.imag.toFixed(2)}j
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <label className="font-medium">Real (σ)</label>
                        <input 
                          type="number" step="0.1"
                          className="w-16 text-right bg-white border border-slate-200 rounded px-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={selectedItem.real}
                          onChange={(e) => updateSelected('real', parseFloat(e.target.value))}
                        />
                      </div>
                      <input
                        type="range" min="-20" max="20" step="0.1"
                        value={selectedItem.real}
                        onChange={(e) => updateSelected('real', parseFloat(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <label className="font-medium">Imaginary (jω)</label>
                        <input 
                          type="number" step="0.1"
                          className="w-16 text-right bg-white border border-slate-200 rounded px-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={selectedItem.imag}
                          onChange={(e) => updateSelected('imag', parseFloat(e.target.value))}
                        />
                      </div>
                      <input
                        type="range" min="-20" max="20" step="0.1"
                        value={selectedItem.imag}
                        onChange={(e) => updateSelected('imag', parseFloat(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gain Control */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">System Gain (K)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={gain}
                    onChange={(e) => setGain(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-900 bg-white"
                  />
                   <input
                    type="range" min="0.1" max="100" step="0.1"
                    value={gain}
                    onChange={(e) => setGain(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <ComplexList
                title="Zeros (Numerator)" items={zeros} onChange={setZeros}
                colorClass="border-emerald-100 shadow-emerald-50"
                selectedId={selectedId} onSelect={(id) => handleSelect(id, 'zero')}
              />

              <ComplexList
                title="Poles (Denominator)" items={poles} onChange={setPoles}
                colorClass="border-rose-100 shadow-rose-50"
                selectedId={selectedId} onSelect={(id) => handleSelect(id, 'pole')}
              />
            </>
          ) : (
            <>
              {/* Transfer Function Mode Controls */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 pb-2 border-b border-slate-200">
                  <Calculator size={16} /> Define H(s) Coefficients
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                   Enter coefficients of the polynomial in descending powers of <i>s</i>. 
                   <br/>Example: <code>1 2 1</code> equals <span className="font-serif italic">s² + 2s + 1</span>.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Numerator (Zeros)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={numCoeffs}
                      onChange={(e) => setNumCoeffs(e.target.value)}
                      placeholder="e.g., 1"
                      className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm text-slate-900 bg-white shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <span className="text-xs text-emerald-500 font-bold">N(s)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Denominator (Poles)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={denCoeffs}
                      onChange={(e) => setDenCoeffs(e.target.value)}
                      placeholder="e.g., 1 2 1"
                      className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm text-slate-900 bg-white shadow-sm"
                    />
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <span className="text-xs text-rose-500 font-bold">D(s)</span>
                    </div>
                  </div>
                </div>

                {tfError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                    {tfError}
                  </div>
                )}

                <button
                  onClick={handleTransferFunctionSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg transition-colors font-medium text-sm"
                >
                  Generate Plots <ArrowRight size={14} />
                </button>
              </div>

              {/* Read-Only View of Current Poles/Zeros */}
              <div className="opacity-70 pointer-events-none">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Calculated Roots</h4>
                 <div className="space-y-2">
                    <div className="text-xs text-slate-600 bg-white p-2 border rounded">
                       <span className="font-bold text-rose-500">Poles:</span> {poles.length}
                    </div>
                    <div className="text-xs text-slate-600 bg-white p-2 border rounded">
                       <span className="font-bold text-emerald-500">Zeros:</span> {zeros.length}
                    </div>
                 </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
               onClick={() => {
                 setPoles([]);
                 setZeros([]);
                 setGain(1);
                 setAnalysis("");
                 setSelectedId(null);
                 setSelectedType(null);
                 if(inputMode === 'transferFunction') {
                    setNumCoeffs("1");
                    setDenCoeffs("1 1");
                 }
               }}
               className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RefreshCcw size={14} /> Reset System
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-900">System Dashboard</h2>
               <p className="text-slate-500 text-sm mt-1">
                 {inputMode === 'interactive' 
                   ? 'Interactive Pole-Zero Placement Mode' 
                   : 'Transfer Function H(s) Mode'}
               </p>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full font-medium shadow-md transition-all
                ${isAnalyzing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> AI Analysis
                </>
              )}
            </button>
          </div>

          {/* Grid Layout for Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Pole Zero Map & Equation */}
            <div className="space-y-6">
              <PoleZeroMap poles={poles} zeros={zeros} selectedId={selectedId} />
              
              {/* Equation Preview */}
              <div className="bg-slate-900 text-slate-200 p-6 rounded-xl shadow-inner font-mono text-sm overflow-x-auto">
                <p className="opacity-50 text-xs mb-2 uppercase tracking-wider">
                  {inputMode === 'interactive' ? 'Factored Form H(s)' : 'Transfer Function H(s)'}
                </p>
                <div className="flex items-center gap-4">
                  <span>H(s) = {gain.toFixed(2)} ×</span>
                  <div className="flex flex-col items-center gap-1">
                    <div className="border-b border-slate-500 px-2 pb-1 whitespace-nowrap">
                      {zeros.length === 0 ? "1" : zeros.map((z, i) => (
                        <span key={i} className={`mx-1 ${z.id === selectedId ? 'text-emerald-400 font-bold' : ''}`}>
                          (s {z.real >= 0 ? '-' : '+'} {Math.abs(z.real).toFixed(1)}{z.imag !== 0 ? ` ${z.imag > 0 ? '-' : '+'} j${Math.abs(z.imag).toFixed(1)}` : ''})
                        </span>
                      ))}
                    </div>
                    <div className="px-2 pt-1 whitespace-nowrap">
                      {poles.length === 0 ? "1" : poles.map((p, i) => (
                        <span key={i} className={`mx-1 ${p.id === selectedId ? 'text-rose-400 font-bold' : ''}`}>
                          (s {p.real >= 0 ? '-' : '+'} {Math.abs(p.real).toFixed(1)}{p.imag !== 0 ? ` ${p.imag > 0 ? '-' : '+'} j${Math.abs(p.imag).toFixed(1)}` : ''})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Frequency Responses */}
            <div className="space-y-6">
              <BodeChart data={bodeData} />
              
              {/* CONDITIONAL RENDER: Phase Chart only in Transfer Function Mode */}
              {inputMode === 'transferFunction' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <PhaseChart data={phaseData} />
                </div>
              )}
              {inputMode === 'interactive' && (
                <div className="h-[300px] bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                   <Activity className="w-10 h-10 mb-2 opacity-50" />
                   <p className="font-medium text-sm">Phase Plot Hidden</p>
                   <p className="text-xs mt-1 max-w-[200px]">Switch to "System Function" mode to view the phase response.</p>
                </div>
              )}
            </div>

          </div>

          {/* Analysis Section */}
          {(analysis || isAnalyzing) && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Cpu className="w-5 h-5 text-violet-600" />
                <h3 className="font-semibold text-lg">System Analysis</h3>
              </div>
              
              {isAnalyzing ? (
                <div className="space-y-3 animate-pulse">
                   <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                   <div className="h-4 bg-slate-100 rounded w-full"></div>
                   <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;