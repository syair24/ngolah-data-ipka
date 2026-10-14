type ToggleAllDatesButtonProps = {
  allExpanded: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function ToggleAllDatesButton({
  allExpanded,
  disabled = false,
  onClick,
}: ToggleAllDatesButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {allExpanded ? 'Hide All' : 'Show All'}
    </button>
  );
}
