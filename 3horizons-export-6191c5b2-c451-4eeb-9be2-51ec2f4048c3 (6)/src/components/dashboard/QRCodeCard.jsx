import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QRCodeGenerator from '@/components/QRCodeGenerator';
import CardCustomizer from '@/components/CardCustomizer';
import {
  QrCode,
  Palette,
  Download,
  Copy
} from 'lucide-react';
import qrcode from 'qrcode';

export const QRCodeCard = ({ selectedLocation, storeName, onCardDesignSave, rewards }) => {
  const { toast } = useToast();
  const [qrCodeUrl] = useState(`${window.location.origin}/customer/signup/${selectedLocation.id}`);

  const handleDownloadQr = (bgColor, fgColor, filetype = 'png') => {
    const isTransparent = bgColor === 'transparent';
    
    qrcode.toDataURL(qrCodeUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: fgColor,
        light: isTransparent ? '#00000000' : bgColor,
      },
      type: 'image/png',
    }, (error, url) => {
      if (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not generate QR code for download.", variant: "destructive" });
        return;
      }
      const link = document.createElement('a');
      const colorName = fgColor === '#000000' ? 'black' : 'white';
      const fileName = `${storeName.replace(/\s+/g, '-')}-qr-code${isTransparent ? `-${colorName}-transparent` : ''}.${filetype}`;
      link.download = fileName;
      link.href = url;
      link.click();
    });
  };

  const handleCopyQrUrl = () => {
    navigator.clipboard.writeText(qrCodeUrl);
    toast({ title: "Copied!", description: "QR code URL copied to clipboard." });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <QrCode className="w-5 h-5 mr-2 text-purple-400" />
        Customer Signup QR Code
      </h2>
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="bg-white p-4 rounded-lg">
          {qrCodeUrl ? <QRCodeGenerator value={qrCodeUrl} size={150} /> : <div>Loading QR...</div>}
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-lg font-medium text-white mb-2">Scan to Join!</h3>
          <p className="text-gray-300 mb-4">
            Customers scan this code to get their digital loyalty card for this location.
          </p>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Palette className="w-4 h-4 mr-2" />
                  Customize Card
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] glass-effect">
                <DialogHeader>
                  <DialogTitle>Customize Loyalty Card</DialogTitle>
                </DialogHeader>
                <CardCustomizer location={selectedLocation} onSave={onCardDesignSave} rewards={rewards} />
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownloadQr('#FFFFFF', '#000000')}>Standard QR Code (.png)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadQr('transparent', '#000000')}>Black (Transparent BG)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadQr('transparent', '#FFFFFF')}>White (Transparent BG)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleCopyQrUrl}>
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};