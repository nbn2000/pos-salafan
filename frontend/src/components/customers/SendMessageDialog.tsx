import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import { useSendMessageMutation } from '@/api/messages';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  clientPhone: string;
}

export function SendMessageDialog({
  open,
  onClose,
  clientId,
  clientName,
  clientPhone,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState('');
  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Xabar matni kiritilishi shart');
      return;
    }

    try {
      await sendMessage({
        clientIds: [clientId],
        message: message.trim(),
      }).unwrap();

      toast.success(`${clientName}ga xabar yuborildi`);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Xabar yuborishda xatolik:', error);
      toast.error('Xabar yuborishda xatolik yuz berdi');
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  // Predefined message templates
  const templates = [
    'Salom! Sizning qarzingiz haqida eslatma.',
    "Hurmatli mijoz, to'lovni amalga oshiring.",
    "Yangi mahsulotlarimiz haqida ma'lumot.",
    'Maxsus chegirmalar haqida xabar.',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            SMS yuborish
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1">
              <div>
                <strong>Mijoz:</strong> {clientName}
              </div>
              <div>
                <strong>Telefon:</strong> {clientPhone}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tez shablonlar:</Label>
            <div className="grid gap-2">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-xs text-left justify-start"
                  onClick={() => setMessage(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Xabar matni <span className="text-red-500">*</span>
            </Label>
            <TextArea
              id="message"
              placeholder="SMS xabar matnini kiriting..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              rows={4}
              className="resize-none"
              maxLength={160}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/160 belgi
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button onClick={handleSend} disabled={isLoading || !message.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Yuborish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
