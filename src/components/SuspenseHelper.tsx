// app/prescription/page.tsx
import { Suspense } from "react";

export default function SuspenseHelper({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading prescription…</div>}>
      {children}
    </Suspense>
  );
}
