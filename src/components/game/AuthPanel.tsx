import { useEffect, useState } from "react";
import { CloudCheck, CloudOff, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useGame } from "@/lib/game-state";

export function AuthPanel() {
  const { cloud } = useGame();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [offerRestore, setOfferRestore] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      if (data.session) setOfferRestore(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
      if (event === "SIGNED_IN") setOfferRestore(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setMsg(signUpError ? signUpError.message : "Account created — you're saving to the cloud now ✨");
    } else {
      setMsg("Welcome back! Your journey now syncs automatically.");
    }
    setBusy(false);
  };

  const google = async () => {
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setMsg("Google sign-in did not complete. Try again.");
  };

  if (userEmail) {
    return (
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <CloudCheck className="size-5 text-success" />
          <span className="truncate">Saving to cloud as {userEmail}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {cloud.status === "saving" ? "· saving…" : cloud.status === "saved" ? "· saved" : ""}
          </span>
        </div>
        <div className="flex gap-2">
          {offerRestore && (
            <button
              onClick={async () => {
                const ok = await cloud.restore();
                setOfferRestore(false);
                setMsg(ok ? "Previous journey restored." : "No saved journey found yet.");
              }}
              className="rounded-full gold-fill px-4 py-2 text-sm font-extrabold text-primary-foreground shadow-gold"
            >
              Continue your financial journey?
            </button>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-extrabold text-muted-foreground transition hover:bg-blush"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
        {msg && <p className="w-full text-xs font-semibold text-muted-foreground">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <CloudOff className="size-5 text-muted-foreground" />
          Playing locally — sign in to save your journey across devices
        </span>
        <span className="rounded-full gold-fill px-4 py-2 text-sm font-extrabold text-primary-foreground shadow-gold">
          {open ? "Close" : "Save to cloud"}
        </span>
      </button>

      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            type="email"
            className="rounded-4xl border-2 border-border bg-card/80 px-5 py-3 text-sm font-semibold outline-none focus:border-gold"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="rounded-4xl border-2 border-border bg-card/80 px-5 py-3 text-sm font-semibold outline-none focus:border-gold"
          />
          <div className="flex gap-2">
            <button
              disabled={busy || !email || password.length < 6}
              onClick={signIn}
              className="rounded-4xl gold-fill px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-gold disabled:opacity-50"
            >
              Continue
            </button>
            <button
              onClick={google}
              className="rounded-4xl border-2 border-gold bg-card/80 px-5 py-3 text-sm font-extrabold"
            >
              Google
            </button>
          </div>
          {msg && <p className="sm:col-span-3 text-xs font-semibold text-muted-foreground">{msg}</p>}
        </div>
      )}
    </div>
  );
}
