import { Dialog } from "@/components/ui/dialog";
import { Lp07LeadFormDialogContent } from "@/forms/lead/Lp07LeadFormDialogContent";

interface LeadFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadFormDialog = ({ isOpen, onClose }: LeadFormDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <Lp07LeadFormDialogContent isOpen={isOpen} onClose={onClose} />
  </Dialog>
);
