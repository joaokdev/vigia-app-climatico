import { SplitAuthShell } from "@/components/auth/SplitAuthShell";
import { SplitPanelAuth } from "@/components/effects/split-panel-auth/SplitPanelAuth";

export default function LoginPage() {
  return (
    <SplitAuthShell>
      <SplitPanelAuth initialMode="login" />
    </SplitAuthShell>
  );
}
