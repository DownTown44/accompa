// The live region stays mounted so assistive tech announces the message when it appears.
// An action button sits inside the region, after the message.
export function StatusNote({ message, action }: { message?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <p className="status-note" aria-live="polite">
      {message}
      {message && action ? (
        <>
          {' '}
          <button type="button" className="status-action" onClick={action.onClick}>
            {action.label}
          </button>
        </>
      ) : null}
    </p>
  )
}
