"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellSlash } from "@phosphor-icons/react";
import { subscribeToPush } from "@/app/dashboard/actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) array[i] = raw.charCodeAt(i);
  return array;
}

export function PushNotificationsButton() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  function enable() {
    setError(null);
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError("Necesitás aceptar el permiso de notificaciones del navegador.");
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
        const json = sub.toJSON();
        const result = await subscribeToPush({
          endpoint: json.endpoint!,
          keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        });
        if (result.error) {
          setError(result.error);
        } else {
          setSubscribed(true);
        }
      } catch {
        setError("No se pudieron activar las notificaciones en este dispositivo.");
      }
    });
  }

  if (!supported) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={enable}
        disabled={pending || subscribed}
        aria-label="Activar notificaciones"
        className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
      >
        {subscribed ? (
          <Bell size={14} weight="fill" className="text-emerald-400" />
        ) : (
          <BellSlash size={14} weight="bold" />
        )}
        {subscribed
          ? "Notificaciones activas"
          : pending
            ? "Activando..."
            : "Activar notificaciones"}
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}
