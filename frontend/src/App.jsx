import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Microscope,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  XCircle,
} from 'lucide-react';

const API_BASE = '/api';

const SCALE_LABELS = {
  scale_0_3: [
    { value: 0, label: '0 - Absent', short: '0: Absent' },
    { value: 1, label: '1 - Mild', short: '1: Mild' },
    { value: 2, label: '2 - Moderate', short: '2: Mod' },
    { value: 3, label: '3 - Severe', short: '3: Sev' },
  ],
  binary_0_1: [
    { value: 0, label: '0 - Negative (No)', short: 'No' },
    { value: 1, label: '1 - Positive (Yes)', short: 'Yes' },
  ],
};

export default function App() {
  const [metadata, setMetadata] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Clinical'); // 'Clinical' | 'Histopathological' | 'All'
  const [searchQuery, setSearchQuery] = useState('');
  const [featureValues, setFeatureValues] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  const resultsRef = useRef(null);

  // Initialize features to default 0
  const initializeDefaults = (featuresList) => {
    const initial = {};
    featuresList.forEach((f) => {
      initial[f.name] = 0;
    });
    setFeatureValues(initial);
  };

  // Fetch metadata and health status on mount
  useEffect(() => {
    const fetchMetadataAndHealth = async () => {
      try {
        setBackendStatus('checking');
        const [metaRes, healthRes] = await Promise.all([
          fetch(`${API_BASE}/metadata`),
          fetch(`${API_BASE}/health`),
        ]);

        if (!metaRes.ok || !healthRes.ok) {
          throw new Error('Backend service returned an error status.');
        }

        const metaData = await metaRes.json();
        setMetadata(metaData);
        initializeDefaults(metaData.features_metadata);
        setBackendStatus('online');
      } catch (err) {
        console.error('Initialization error:', err);
        setBackendStatus('offline');
        setApiError('Could not connect to the backend API. Please ensure the backend server is running on port 8000.');
      }
    };

    fetchMetadataAndHealth();
  }, []);

  // Filter features based on active category and search
  const filteredFeatures = useMemo(() => {
    if (!metadata?.features_metadata) return [];
    return metadata.features_metadata.filter((f) => {
      const matchesCategory =
        activeCategory === 'All' || f.category === activeCategory;
      const matchesSearch =
        f.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [metadata, activeCategory, searchQuery]);

  // Clinical vs Histopathological feature lists
  const clinicalFeatures = useMemo(() => {
    if (!metadata?.features_metadata) return [];
    return metadata.features_metadata.filter((f) => f.category === 'Clinical');
  }, [metadata]);

  const histoFeatures = useMemo(() => {
    if (!metadata?.features_metadata) return [];
    return metadata.features_metadata.filter((f) => f.category === 'Histopathological');
  }, [metadata]);

  // Counts of active non-zero features per category
  const clinicalActiveCount = useMemo(() => {
    return clinicalFeatures.filter((f) => (featureValues[f.name] ?? 0) > 0).length;
  }, [clinicalFeatures, featureValues]);

  const histoActiveCount = useMemo(() => {
    return histoFeatures.filter((f) => (featureValues[f.name] ?? 0) > 0).length;
  }, [histoFeatures, featureValues]);

  const totalActiveCount = clinicalActiveCount + histoActiveCount;

  // Handle value change for a feature
  const handleFeatureChange = (name, val) => {
    setFeatureValues((prev) => ({
      ...prev,
      [name]: val,
    }));
    setSelectedPresetId(null); // Clear selected preset if modified manually
  };

  // Reset form to zeros
  const handleReset = () => {
    if (metadata?.features_metadata) {
      initializeDefaults(metadata.features_metadata);
      setPrediction(null);
      setApiError(null);
      setSelectedPresetId(null);
    }
  };

  // Load a test case preset from metadata
  const handleLoadPreset = (preset) => {
    if (preset?.features) {
      setFeatureValues({ ...preset.features });
      setSelectedPresetId(preset.class_id);
      setPrediction(null);
      setApiError(null);
    }
  };

  // Trigger classification prediction
  const handlePredict = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(featureValues),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Prediction failed with status ${res.status}`);
      }

      const result = await res.json();
      setPrediction(result);

      // Auto-scroll on mobile/tablet to the results
      if (window.innerWidth < 1024 && resultsRef.current) {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setApiError(err.message || 'An unexpected error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 text-white p-2.5 rounded-xl shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">DermAI Studio</span>
                <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
                  Gaussian NB
                </span>
                <span className="hidden sm:inline-block bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full font-medium">
                  33-Feature Multiclass
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Erythemato-Squamous Dermatology Disease Classifier & Diagnostic Decision Aid
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-white shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-bounce'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-700 font-medium">
                {backendStatus === 'online'
                  ? 'Model Ready'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Backend Offline'}
              </span>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition"
              title="Reset all feature inputs to 0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
          </div>
        </div>
      </header>

      {/* Medical Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200/90 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-start space-x-2.5 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-900">Clinical Decision Support Disclaimer:</strong> This web application utilizes a supervised Gaussian Naive Bayes classifier trained on dermatological attributes for educational, informational, and clinical research evaluation. It <span className="underline font-semibold">does not constitute medical diagnosis</span> or replace evaluation by a licensed dermatologist or dermatopathologist.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assessment Form & Feature Panels (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">

          {/* Quick Verified Presets Bar */}
          {metadata?.sample_presets && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Verified Benchmark Test Cases (6 Presets)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click to autofill validated test cases from the UCI dataset
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(metadata.sample_presets).map((preset) => {
                  const isSelected = selectedPresetId === preset.class_id;
                  return (
                    <button
                      key={preset.class_id}
                      onClick={() => handleLoadPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border transition group relative ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800'
                        }`}>
                          Class {preset.class_id}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        )}
                      </div>
                      <div className="font-semibold text-xs text-slate-800 mt-1 truncate group-hover:text-teal-900">
                        {preset.disease_name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Test Sample #{preset.sample_index}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stepper / Assessment Group Navigation */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            {/* Header with Assessment Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>33-Feature Diagnostic Assessment</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Graded on standard clinical scale: 0 (Absent) to 3 (Severe)
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center space-x-2">
                <div className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-semibold text-teal-800 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                  <span>{totalActiveCount} of 33 Findings Active</span>
                </div>
              </div>
            </div>

            {/* Stepped Tab Buttons for Clinical (11) vs Histopathological (22) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveCategory('Clinical')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeCategory === 'Clinical'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <div className="text-left">
                    <div>1. Clinical Findings</div>
                    <div className="text-[10px] font-normal text-slate-500">11 physical symptoms</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  clinicalActiveCount > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {clinicalActiveCount}/11
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('Histopathological')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeCategory === 'Histopathological'
                    ? 'bg-white text-purple-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Microscope className="w-4 h-4 text-purple-600" />
                  <div className="text-left">
                    <div>2. Histopathology</div>
                    <div className="text-[10px] font-normal text-slate-500">22 biopsy markers</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  histoActiveCount > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {histoActiveCount}/22
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                  activeCategory === 'All'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <div className="text-left">
                    <div>View All (33)</div>
                    <div className="text-[10px] font-normal text-slate-500">Unified list</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {totalActiveCount}/33
                </span>
              </button>
            </div>

            {/* Quick Search & Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specific feature (e.g. erythema, spongiosis, acanthosis, papules)..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Section Indicator Banner */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Showing {filteredFeatures.length} {activeCategory === 'All' ? 'Total' : activeCategory} Features
            </span>
            <span>
              {activeCategory === 'Clinical' && 'Physical Exam & Dermatological Inspection'}
              {activeCategory === 'Histopathological' && 'Skin Punch Biopsy Light Microscopy'}
              {activeCategory === 'All' && 'Complete 33-Feature Multidimensional Space'}
            </span>
          </div>

          {/* Feature Grid */}
          <div className="space-y-3">
            {filteredFeatures.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                No features match "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFeatures.map((feature) => {
                  const currentValue = featureValues[feature.name] ?? 0;
                  const isBinary = feature.type === 'binary_0_1';
                  const options = isBinary ? SCALE_LABELS.binary_0_1 : SCALE_LABELS.scale_0_3;

                  return (
                    <div
                      key={feature.name}
                      className={`p-4 rounded-2xl border transition-all ${
                        currentValue > 0
                          ? 'border-teal-400/80 bg-teal-50/20 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Feature Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-slate-900">
                              {feature.display_name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                feature.category === 'Clinical'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200/50'
                              }`}
                            >
                              {feature.category === 'Clinical' ? 'Clinical' : 'Biopsy'}
                            </span>
                            {currentValue > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                                Grade: {currentValue}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {feature.name}
                          </span>
                        </div>

                        {/* Medical Tooltip Trigger */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTooltip(activeTooltip === feature.name ? null : feature.name)
                            }
                            className="text-slate-400 hover:text-teal-600 p-1 rounded-md transition"
                            title="View clinical definition"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          {activeTooltip === feature.name && (
                            <div className="absolute right-0 top-7 w-64 z-40 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl leading-relaxed border border-slate-700">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-700 mb-1.5">
                                <span className="font-semibold text-teal-300 text-[11px]">
                                  {feature.display_name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {feature.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-200">{feature.description}</p>
                              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-teal-400 flex justify-between">
                                <span>Allowed Values:</span>
                                <span className="font-mono">{isBinary ? '0 (No), 1 (Yes)' : '0, 1, 2, 3'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Value Selectors (0 to 3 Segmented Buttons) */}
                      <div className={`grid ${isBinary ? 'grid-cols-2' : 'grid-cols-4'} gap-1.5 mt-2`}>
                        {options.map((opt) => {
                          const isSelected = currentValue === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleFeatureChange(feature.name, opt.value)}
                              className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${
                                isSelected
                                  ? opt.value === 0
                                    ? 'bg-slate-700 text-white shadow-xs'
                                    : opt.value === 1
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : opt.value === 2
                                    ? 'bg-teal-700 text-white shadow-xs'
                                    : 'bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                              }`}
                            >
                              <span className="text-[11px]">{opt.short}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stepper Navigation Footer Between Sections */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {activeCategory === 'Clinical' ? (
              <>
                <div className="text-xs text-slate-500">
                  Step 1 of 2 Complete • Review Physical Examination Findings
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCategory('Histopathological')}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <span>Next: Histopathological Findings (22)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : activeCategory === 'Histopathological' ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveCategory('Clinical')}
                  className="w-full sm:w-auto text-slate-600 hover:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition flex items-center justify-center space-x-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Clinical Findings</span>
                </button>
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Model Inference Now</span>
                </button>
              </>
            ) : (
              <>
                <div className="text-xs text-slate-500">
                  Showing all 33 features across Clinical and Histopathological categories
                </div>
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Model Inference</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Prediction Results & Model Information (5 cols) */}
        <div ref={resultsRef} className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-20">

          {/* Inference Action Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Diagnostic Classifier</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                Gaussian Naive Bayes
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Evaluate the 33 submitted clinical & biopsy observations against the trained model to calculate class posterior probabilities and differential ranking.
            </p>

            <button
              type="button"
              onClick={handlePredict}
              disabled={loading || backendStatus === 'offline'}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Diagnostic Inference</span>
                </>
              )}
            </button>

            {apiError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Classification Error:</span>
                  <p className="mt-0.5">{apiError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Prominent Prediction Hero Card */}
          {prediction && (
            <div className="bg-white rounded-2xl border-2 border-teal-500/80 shadow-md overflow-hidden divide-y divide-slate-100 transition-all">
              {/* Primary Result Hero */}
              <div className="p-6 bg-gradient-to-br from-teal-500/15 via-teal-50/30 to-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-teal-700" />
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-teal-800">
                      Primary Predicted Diagnosis
                    </span>
                  </div>
                  <span className="bg-teal-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    ICD-10: {prediction.icd_ref}
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {prediction.disease_name}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    (Class #{prediction.predicted_class})
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-3 rounded-xl border border-teal-100/60">
                  {prediction.description}
                </p>

                {/* Patient Specific Confidence Meter */}
                <div className="mt-4 p-4 bg-white rounded-xl border border-teal-200 shadow-xs">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Patient Prediction Confidence
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        P(Diagnosis | Current Patient Profile)
                      </span>
                    </div>
                    <span className="text-xl font-black text-teal-700">
                      {prediction.confidence_percentage}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 h-3 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, Math.max(0, prediction.confidence * 100))}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    * This individual confidence represents the Bayesian posterior probability conditioned on this patient's 33 observations. It is distinct from the global model test accuracy benchmark (83.78%).
                  </p>
                </div>
              </div>

              {/* Ranked Differential Diagnosis Breakdown */}
              <div className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <BarChart3 className="w-4 h-4 text-teal-600" />
                    <span>Ranked Differential Results (All 6 Classes)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Ranked by Probability</span>
                </div>

                <div className="space-y-2">
                  {prediction.probabilities.map((probItem, index) => {
                    const isTop = index === 0;
                    return (
                      <div
                        key={probItem.class_id}
                        className={`p-2.5 rounded-xl border transition ${
                          isTop
                            ? 'bg-teal-50/70 border-teal-300 shadow-2xs'
                            : 'bg-slate-50/60 border-slate-200/70'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs mb-1">
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                              isTop ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              #{index + 1}
                            </span>
                            <span className={`truncate font-semibold ${
                              isTop ? 'text-teal-950 font-bold' : 'text-slate-700'
                            }`}>
                              {probItem.disease_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({probItem.icd_ref})
                            </span>
                          </div>
                          <span className={`font-mono text-xs font-bold ${
                            isTop ? 'text-teal-800' : 'text-slate-500'
                          }`}>
                            {probItem.percentage}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              isTop ? 'bg-teal-600' : 'bg-slate-400'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, probItem.probability * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Compact Model Information Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Model Specifications & Benchmark
                </h3>
              </div>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>

            {/* 4-Stat Metric Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Algorithm</span>
                <span className="font-bold text-slate-800">Gaussian Naive Bayes</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Input Features</span>
                <span className="font-bold text-slate-800">33 Features (11+22)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-medium">Target Classes</span>
                <span className="font-bold text-slate-800">6 Disease Categories</span>
              </div>
              <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200">
                <span className="text-[10px] text-teal-700 block font-semibold">Test Accuracy Benchmark</span>
                <span className="font-extrabold text-teal-800 text-sm">83.78%</span>
              </div>
            </div>

            {/* Clear Distinction Callout */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Accuracy vs. Confidence Distinction</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                The <strong>83.78% Test Accuracy</strong> is the global validation score measured across unseen test records in the UCI benchmark split. The <strong>Individual Prediction Confidence</strong> reflects the specific Bayesian posterior probability computed for the 33 submitted findings.
              </p>
            </div>
          </div>

          {/* Clinical Grading Guide Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 text-xs text-slate-600 space-y-2 shadow-2xs">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Standard Dermatology Scale Guide</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Attributes in the UCI Dermatology dataset are standardized on an ordinal severity grading scale:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] mt-1 font-medium">
              <div className="p-1.5 bg-slate-50 rounded-lg"><strong>0:</strong> Feature absent</div>
              <div className="p-1.5 bg-slate-50 rounded-lg"><strong>1:</strong> Mild degree</div>
              <div className="p-1.5 bg-slate-50 rounded-lg"><strong>2:</strong> Moderate degree</div>
              <div className="p-1.5 bg-slate-50 rounded-lg"><strong>3:</strong> Severe / maximum</div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Dermatology Disease Classification Studio • Production Architecture
          </div>
          <div>
            FastAPI + Scikit-Learn Gaussian Naive Bayes + React Vite
          </div>
        </div>
      </footer>
    </div>
  );
}
