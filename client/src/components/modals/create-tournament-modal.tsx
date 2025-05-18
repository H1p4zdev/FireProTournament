import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModals } from "@/hooks/use-modal";
import { useLanguage } from "@/hooks/use-language";
import TournamentForm from "@/components/forms/tournament-form";

interface CreateTournamentModalProps {
  open: boolean;
}

const CreateTournamentModal: FC<CreateTournamentModalProps> = ({ open }) => {
  const { closeCreateTournamentModal } = useModals();
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={closeCreateTournamentModal}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createTournament")}</DialogTitle>
        </DialogHeader>
        
        <TournamentForm onSuccess={closeCreateTournamentModal} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
