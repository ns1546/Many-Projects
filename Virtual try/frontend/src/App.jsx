import { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, RefreshCw, Shirt, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function App() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [clothPreview, setClothPreview] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState('');

  const loadingSteps = [
    'Preparing your photo...',
    'Analyzing clothing...',
    'Generating virtual try-on...',
    'Almost ready...'
  ];

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'person') {
      setPersonImage(file);
      setPersonPreview(previewUrl);
    } else {
      setClothImage(file);
      setClothPreview(previewUrl);
    }
    setError(null);
  };

  const handleTryOn = async () => {
    if (!personImage || !clothImage) {
      setError('Please upload both a photo and clothing image.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    
    // Animate loading steps
    let stepIndex = 0;
    setLoadingStep(loadingSteps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < loadingSteps.length) {
        setLoadingStep(loadingSteps[stepIndex]);
      }
    }, 2000);

    const formData = new FormData();
    formData.append('person', personImage);
    formData.append('cloth', clothImage);

    try {
      const response = await axios.post('/api/tryon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes
      });

      if (response.data.success) {
        setResultImage(response.data.image);
      } else {
        setError(response.data.error || 'Failed to generate image.');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("We're having trouble generating your try-on right now. Please try again in a moment.");
      }
    } finally {
      clearInterval(stepInterval);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResultImage(null);
    setPersonImage(null);
    setClothImage(null);
    setPersonPreview(null);
    setClothPreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white font-sans overflow-x-hidden p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300 tracking-tight mb-4"
          >
            AI Virtual Try-On
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-indigo-200/80 max-w-2xl mx-auto"
          >
            Experience the future of e-commerce. See how clothing looks on you before you buy, powered by advanced AI.
          </motion.p>
        </header>

        <main className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
          {/* Background decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {!resultImage ? (
              <motion.div
                key="upload-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
              >
                {/* Person Upload */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-100">
                    <User className="text-pink-400" />
                    1. Your Photo
                  </h3>
                  <label className="relative flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-indigo-400/30 bg-indigo-950/30 hover:bg-indigo-900/40 transition-colors cursor-pointer overflow-hidden group">
                    {personPreview ? (
                      <img src={personPreview} alt="Person" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-indigo-300" />
                        </div>
                        <p className="text-sm font-medium text-indigo-200">Click to upload your photo</p>
                        <p className="text-xs text-indigo-400 mt-2">JPG, PNG, WEBP up to 10MB</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, 'person')} />
                    
                    {personPreview && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">Change Photo</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Cloth Upload */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-100">
                    <Shirt className="text-indigo-400" />
                    2. Clothing Item
                  </h3>
                  <label className="relative flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-indigo-400/30 bg-indigo-950/30 hover:bg-indigo-900/40 transition-colors cursor-pointer overflow-hidden group">
                    {clothPreview ? (
                      <img src={clothPreview} alt="Clothing" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-indigo-300" />
                        </div>
                        <p className="text-sm font-medium text-indigo-200">Click to select clothing</p>
                        <p className="text-xs text-indigo-400 mt-2">JPG, PNG, WEBP up to 10MB</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, 'cloth')} />
                    
                    {clothPreview && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">Change Clothing</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 mt-4">
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-center text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleTryOn}
                    disabled={!personImage || !clothImage || isProcessing}
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.5)]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          {loadingStep}
                        </>
                      ) : (
                        'Try It On Now'
                      )}
                    </span>
                    {/* Button hover effect */}
                    {!isProcessing && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center relative z-10"
              >
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400 mb-6 flex items-center gap-2">
                  <span className="text-3xl">✨</span> Virtual Try-On Complete
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-indigo-300 mb-2 font-medium">Original Photo</span>
                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-lg relative">
                       <img src={personPreview} alt="Original" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center md:col-span-2">
                    <span className="text-sm text-pink-300 mb-2 font-medium">Try-On Result</span>
                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.2)] relative group">
                       <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-md">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
