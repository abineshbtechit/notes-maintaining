import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, FlipHorizontal } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture, title = "Capture Photo" }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [errorMsg, setErrorMsg] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackInputRef = useRef(null);

  // Start camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMsg(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Direct WebRTC camera stream is not supported in this browser environment. You can use the Native Camera Capture button below.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Video play warning:', e));
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setErrorMsg('Camera access could not be initialized or permission was denied. Use the button below to capture with your device camera directly.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // If using user-facing camera, flip horizontally for natural selfie view
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  // Fallback for native camera input (guaranteed on all mobile browsers)
  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCapture(event.target.result);
        handleClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-card" style={{ maxWidth: 640, overflow: 'hidden' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera style={{ color: 'var(--primary)', width: 22, height: 22 }} />
            <h3 style={{ fontSize: 18 }}>{title}</h3>
          </div>
          <button type="button" className="btn-icon-subtle" onClick={handleClose}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 16, textAlign: 'center', background: '#111112' }}>
          {/* Hidden Canvas for snap */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {capturedImage ? (
            /* Snapshot Preview */
            <div style={{ position: 'relative', width: '100%', maxHeight: 420, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block', margin: '0 auto', background: '#000' }}
              />
            </div>
          ) : errorMsg ? (
            /* Fallback Screen */
            <div style={{ padding: '32px 16px', color: '#FFFFFF', maxWidth: 460, margin: '0 auto' }}>
              <Camera style={{ width: 48, height: 48, color: 'var(--primary)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#E2E2E4', marginBottom: 16, fontSize: 14 }}>
                {errorMsg}
              </p>
              <button
                type="button"
                className="btn-duo-primary"
                style={{ width: '100%', marginBottom: 12 }}
                onClick={() => fallbackInputRef.current?.click()}
              >
                <Camera style={{ width: 18, height: 18 }} />
                Open Device Camera Now
              </button>
              <input
                ref={fallbackInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFallbackFile}
              />
            </div>
          ) : (
            /* Live Viewfinder */
            <div style={{ position: 'relative', width: '100%', height: 380, background: '#000000', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />

              {/* Viewfinder Corner Framing Lines */}
              <div style={{
                position: 'absolute',
                inset: 20,
                border: '2px solid rgba(88, 204, 2, 0.45)',
                borderRadius: 12,
                pointerEvents: 'none'
              }} />

              {/* Flip Camera Action */}
              <button
                type="button"
                onClick={toggleCamera}
                title="Switch Camera (Front/Rear)"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FlipHorizontal style={{ width: 20, height: 20 }} />
              </button>

              {/* Shutter Button Overlay */}
              <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <button
                  type="button"
                  onClick={takePhoto}
                  title="Capture Photo"
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: '50%',
                    background: '#58CC02',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 3px #4FBB02',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF' }} />
                </button>
              </div>
            </div>
          )}

          {/* Device camera fallback trigger link */}
          {!capturedImage && !errorMsg && (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => fallbackInputRef.current?.click()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 12,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Or use standard phone camera app
              </button>
              <input
                ref={fallbackInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFallbackFile}
              />
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ background: '#FFFFFF' }}>
          {capturedImage ? (
            <>
              <button type="button" className="btn-duo-secondary" onClick={handleRetake}>
                <RefreshCw style={{ width: 16, height: 16 }} />
                Retake
              </button>
              <button type="button" className="btn-duo-primary" onClick={handleConfirm}>
                <Check style={{ width: 16, height: 16 }} />
                Attach Photo
              </button>
            </>
          ) : (
            <button type="button" className="btn-duo-secondary" style={{ width: '100%' }} onClick={handleClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
