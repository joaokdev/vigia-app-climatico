import { SplitAuthShell } from "@/components/auth/SplitAuthShell";
import { SplitPanelAuth } from "@/components/effects/split-panel-auth/SplitPanelAuth";

export default function CadastroPage() {
  return (
    <SplitAuthShell>
      <SplitPanelAuth initialMode="register" />
    </SplitAuthShell>
  );
}
