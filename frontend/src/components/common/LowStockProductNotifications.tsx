import { useState, useEffect } from 'react';
import { useGetProductsToFillStoreQuery } from '@/api/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X, ExternalLink, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export function LowStockProductNotifications() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const navigate = useNavigate();

  const {
    data: lowStockItems,
    isLoading,
    error,
  } = useGetProductsToFillStoreQuery();

  // Play notification sound when low stock items are detected
  useEffect(() => {
    if (lowStockItems && lowStockItems.length > 0 && !hasPlayedSound) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Fallback: use system beep or show toast
        toast.warning(`${lowStockItems.length} ta mahsulot zaxirasi kam!`);
      });
      setHasPlayedSound(true);
      setIsVisible(true);
    }
  }, [lowStockItems, hasPlayedSound]);

  if (isLoading || error || !lowStockItems || lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="relative z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        <Bell className="h-4 w-4 mr-2" />
        <Badge variant="destructive" className="ml-1">
          {lowStockItems.length}
        </Badge>
      </Button>
      {isVisible && (
        <div className="absolute top-full right-0 z-50 w-96 max-w-[calc(100vw-2rem)] mt-2">
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Mahsulot zaxirasi tugayapti!
                  </h4>
                  <div className="text-blue-700">
                    <div className="space-y-2">
                      {lowStockItems.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{item.message}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Extract product ID from the link and navigate to product page
                              const productId = item.link.split('/').pop();
                              navigate(`/products/${productId}`);
                              setIsVisible(false);
                            }}
                            className="h-6 px-2 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {lowStockItems.length > 3 && (
                        <p className="text-xs text-blue-600">
                          va yana {lowStockItems.length - 3} ta...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
