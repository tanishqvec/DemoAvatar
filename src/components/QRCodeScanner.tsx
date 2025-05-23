
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface QRCodeScannerProps {
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!scannerContainerRef.current) return;
    
    // Create scanner instance
    const scannerId = 'qr-scanner';
    const scannerContainer = scannerContainerRef.current;
    const existingElement = document.getElementById(scannerId);
    
    if (existingElement) {
      existingElement.innerHTML = '';
    } else {
      const newElement = document.createElement('div');
      newElement.id = scannerId;
      scannerContainer.appendChild(newElement);
    }
    
    scannerRef.current = new Html5Qrcode(scannerId);
    
    // Start scanning
    scannerRef.current.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      (decodedText) => {
        console.log('QR code scanned:', decodedText);
        // If the scanned data is a URL, redirect to it
        if (decodedText.startsWith('http')) {
          window.location.href = decodedText;
        } else if (decodedText === 'session') {
          window.location.href = '/session';
        } else {
          window.open(decodedText, '_blank');
        }
        
        if (scannerRef.current) {
          scannerRef.current.stop().catch(error => {
            console.error('Failed to stop scanner:', error);
          });
        }
        onClose();
      },
      (errorMessage) => {
        // QR scan error doesn't need to be displayed to the user
        console.warn('QR scan error:', errorMessage);
      }
    ).catch((err) => {
      console.error('Scanner start error:', err);
      setError('Error accessing camera. Please ensure camera permissions are granted.');
    });
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(error => {
          console.error('Failed to stop scanner on unmount:', error);
        });
      }
    };
  }, [onClose]);

  const toggleCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        if (!scannerContainerRef.current) return;
        
        scannerRef.current?.start(
          { facingMode: "user" },
          {
            fps: 10,
            qrbox: 250
          },
          (decodedText) => {
            console.log('QR code scanned:', decodedText);
            // Handle QR code scanning result
            if (decodedText.startsWith('http')) {
              window.location.href = decodedText;
            } else if (decodedText === 'session') {
              window.location.href = '/session';
            } else {
              window.open(decodedText, '_blank');
            }
            
            if (scannerRef.current) {
              scannerRef.current.stop().catch(error => {
                console.error('Failed to stop scanner:', error);
              });
            }
            onClose();
          },
          (errorMessage) => {
            console.warn('QR scan error:', errorMessage);
          }
        ).catch((err) => {
          console.error('Failed to toggle camera:', err);
          setError('Failed to toggle camera. Please try again.');
        });
      }).catch((err) => {
        console.error('Failed to stop scanner before toggle:', err);
      });
    }
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="w-full max-w-md mx-auto mb-4">
        <h2 className="text-xl font-bold text-white mb-2 text-center">Scan QR Code</h2>
        <p className="text-white/70 text-center mb-4">Position the QR code in the camera view</p>
      </div>
      
      <div 
        ref={scannerContainerRef} 
        className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border-2 border-primary flex items-center justify-center bg-black"
      >
        {/* Scanner will be injected here */}
        <div className="absolute inset-0 border-[20px] border-black/50 pointer-events-none">
          <div className="absolute inset-0 border-2 border-white/30"></div>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 mt-4 text-center">{error}</p>
      )}
      
      <div className="mt-6">
        <Button onClick={toggleCamera} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
          Switch Camera
        </Button>
      </div>
    </Card>
  );
};

export default QRCodeScanner;
