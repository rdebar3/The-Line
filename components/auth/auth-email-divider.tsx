export function AuthEmailDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-navy-border/60" />
      </div>
      <p className="relative mx-auto w-fit bg-navy-elevated/90 px-3 text-xs text-muted-foreground">
        or continue with email
      </p>
    </div>
  );
}