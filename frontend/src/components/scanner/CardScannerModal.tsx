import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  ScanLine,
  Image as ImageIcon,
  SwitchCamera,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { useToast } from '../../context/ToastContext';
import { ocrService } from '../../services/ocr/TesseractOCRService';
import type { OCRScanResult } from '../../types/contact';
import { Modal } from '../common/Modal';
import { SampleCardPicker } from './SampleCardPicker';

export const CardScannerModal: React.FC = () => {
  const { isScannerOpen, closeScanner, handleOcrComplete, categories } = useContacts();
  const { showToast } = useToast();

  // Mode: 'camera' | 'upload' | 'review'
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>('camera');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Video & Stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scanning & Extraction State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<OCRScanResult | null>(null);

  // Editable fields in review step
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAlternatePhone, setEditAlternatePhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editCategory, setEditCategory] = useState('Other');
  const [editAddress, setEditAddress] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError('Camera access not available or permission denied. You can upload an image or choose a sample card below.');
    }
  }, [cameraFacing]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (isScannerOpen && activeMode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen, activeMode, capturedImage, startCamera, stopCamera]);

  // Reset state when modal closes
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setExtractedData(null);
    setIsScanning(false);
    setScanProgress(0);
    closeScanner();
  };

  // Toggle Front/Back camera
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process Card Image through OCR Engine
  const processCardImage = async (imageSrc: string) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatusText('Initializing Optical Character Recognition...');
    setCapturedImage(imageSrc);
    stopCamera();

    try {
      const result = await ocrService.recognizeCard(imageSrc, (status, pct) => {
        setScanStatusText(status);
        setScanProgress(pct);
      });

      setExtractedData(result);
      setEditName(result.name || '');
      setEditPhone(result.phone || '');
      setEditAlternatePhone(result.alternatePhone || '');
      setEditEmail(result.email || '');
      setEditCompany(result.company || '');
      setEditDesignation(result.designation || '');
      setEditCategory(result.suggestedCategory || 'Other');
      setEditAddress(result.address || '');
      setEditWebsite(result.website || '');

      showToast(`Visiting card processed (${result.confidence}% confidence)`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error processing card', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Capture current camera video frame
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    processCardImage(dataUrl);
  };

  // Handle File Upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      processCardImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Confirm and Pass Extracted Info to ContactVault
  const handleConfirmAndSave = () => {
    if (!editName.trim() || !editPhone.trim()) {
      showToast('Name and Phone number are required', 'warning');
      return;
    }

    const finalResult: OCRScanResult = {
      rawText: extractedData?.rawText || '',
      name: editName.trim(),
      phone: editPhone.trim(),
      alternatePhone: editAlternatePhone.trim(),
      email: editEmail.trim(),
      company: editCompany.trim(),
      designation: editDesignation.trim(),
      website: editWebsite.trim(),
      address: editAddress.trim(),
      suggestedCategory: editCategory,
      confidence: extractedData?.confidence || 90,
    };

    handleOcrComplete(finalResult, capturedImage || undefined);
    handleClose();
  };

  return (
    <Modal
      isOpen={isScannerOpen}
      onClose={handleClose}
      title="Visiting Card Scanner"
      subtitle="AI-powered OCR extracts name, phone, email & role in seconds"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* If Not Yet Scanned or Scanning: Capture Screen */}
        {!extractedData && (
          <div className="space-y-4">
            {/* Mode Switch Tabs (Camera vs Upload) */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('camera');
                  setCapturedImage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'camera'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('upload');
                  stopCamera();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeMode === 'upload'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>

            {/* Live Camera View */}
            {activeMode === 'camera' && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center border border-slate-800 shadow-inner">
                {cameraError ? (
                  <div className="p-6 text-center text-slate-300 max-w-sm">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-semibold text-white mb-1">
                      Camera Not Available
                    </p>
                    <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
                    <button
                      onClick={() => setActiveMode('upload')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
                    >
                      Upload Card Photo Instead
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Card Alignment Framing Guide */}
                    <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400 -mt-1 -ml-1" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400 -mt-1 -mr-1" />
                      </div>
                      <p className="text-[11px] font-bold text-white/90 text-center bg-black/40 backdrop-blur-xs py-1 px-3 rounded-full mx-auto shadow-xs">
                        Align visiting card inside the frame
                      </p>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400 -mb-1 -ml-1" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400 -mb-1 -mr-1" />
                      </div>
                    </div>

                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 z-10 px-4">
                      {/* Flip camera */}
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 active:scale-95 transition"
                        title="Flip Camera"
                      >
                        <SwitchCamera className="w-5 h-5" />
                      </button>

                      {/* Big Shutter / Capture Button */}
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="w-16 h-16 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all p-1"
                        title="Capture Card"
                      >
                        <div className="w-full h-full rounded-full border-4 border-indigo-600 flex items-center justify-center">
                          <ScanLine className="w-7 h-7" />
                        </div>
                      </button>

                      {/* Spacer for symmetry */}
                      <div className="w-11 h-11" />
                    </div>
                  </>
                )}

                {/* Laser Scanning Animation Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                    <div className="relative w-48 h-32 border-2 border-indigo-500 rounded-xl overflow-hidden mb-4 bg-indigo-950/30">
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-laser shadow-[0_0_12px_#38bdf8]" />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{scanStatusText}</p>
                    <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-indigo-300 font-mono">{scanProgress}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Upload View */}
            {activeMode === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50/80 p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-800">
                  Click to browse or drop visiting card image
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Supports JPG, PNG, WEBP, and high-resolution camera photos.
                </p>
              </div>
            )}

            {/* Instant Sample Card Picker */}
            <SampleCardPicker onSelectSample={(svg) => processCardImage(svg)} />
          </div>
        )}

        {/* Extracted Data Review Step */}
        {extractedData && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Success Banner */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Visiting Card Scanned Successfully!
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Extracted details with {extractedData.confidence}% confidence. Review and edit before saving.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExtractedData(null);
                  setCapturedImage(null);
                  if (activeMode === 'camera') startCamera();
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-scan</span>
              </button>
            </div>

            {/* Two-Column Review Layout: Card Image (Left) + Editable Form (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Card Image Thumbnail */}
              {capturedImage && (
                <div className="md:col-span-5 flex flex-col space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Scanned Card Image
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-xs">
                    <img
                      src={capturedImage}
                      alt="Scanned Business Card"
                      className="w-full object-contain max-h-56 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Editable Extracted Fields */}
              <div className={`space-y-3 ${capturedImage ? 'md:col-span-7' : 'md:col-span-12'}`}>
                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Full Name"
                  />
                </div>

                {/* Phone & Alternate */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Mobile Phone"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Alt Phone
                    </label>
                    <input
                      type="tel"
                      value={editAlternatePhone}
                      onChange={(e) => setEditAlternatePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Email & Category */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Company & Designation */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Company / College"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Role / Title"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Address / Location"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="flex-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Contact to Vault</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
