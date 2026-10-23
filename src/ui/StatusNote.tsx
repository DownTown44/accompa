// The live region stays mounted so assistive tech announces the message when it appears.
export function StatusNote({ message }: { message?: string }) {
  return (
    <p className="status-note" aria-live="polite">
      {message}
    </p>
  )
}
