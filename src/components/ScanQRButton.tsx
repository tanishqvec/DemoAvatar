
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import QRCodeScanner from '@/components/QRCodeScanner';

interface ScanQRButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ScanQRButton: React.FC<ScanQRButtonProps> = ({ 
  variant = "default", 
  size = "default",
  className = ""
}) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleOpenScanner}
        className={className}
      >
        <QrCode className="mr-2 h-4 w-4" />
        Scan QR Code
      </Button>

      {showScanner && (
        <QRCodeScanner onClose={handleCloseScanner} />
      )}
    </>
  );
};

export default ScanQRButton;
