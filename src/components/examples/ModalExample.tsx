
import { useModal } from "@/components/ui/modal-provider";
import { Button } from "@/components/ui/button";

export function ModalExample() {
  const { openModal } = useModal();

  const handleOpenDeleteConfirmation = () => {
    openModal("deleteConfirm", {
      title: "Delete Item",
      description: "Are you sure you want to delete this item? This action cannot be undone.",
      onConfirm: () => {
        console.log("Item deleted");
      }
    });
  };

  const handleOpenTeamSelection = () => {
    openModal("teamSelection", {
      initialTeam: "Robert Smith",
      onSave: (team: string) => {
        console.log("Selected team:", team);
      }
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Modal System Examples</h2>
      <div className="space-x-4">
        <Button onClick={handleOpenTeamSelection}>
          Change Team
        </Button>
        <Button variant="destructive" onClick={handleOpenDeleteConfirmation}>
          Delete Item
        </Button>
      </div>
    </div>
  );
}
