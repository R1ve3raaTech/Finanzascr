"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { subscribeToPush } from "@/app/dashboard/actions";
import { setNotificationsEnabled } from "@/app/dashboard/settings/actions";

const knobSpring = { type: "spring", stiffness: 500, damping: 30 } as const;
const tap = { type: "spring", stiffness: 400, damping: 25 } as const;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) array[i] = raw.charCodeAt(i);
  return array;
}

export function NotificationsSetting({ initial }: { initial: boolean }) {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(initial);
  const [supported, setSupported] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  function toggle() {
    setError(null);
    const next = !enabled;
    startTransition(async () => {
      if (next) {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            setError("Necesitás aceptar el permiso de notificaciones del navegador.");
            return;
          }
          const reg = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
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
            return;
          }
          await setNotificationsEnabled(true);
          setEnabled(true);
        } catch {
          setError("No se pudieron activar las notificaciones en este dispositivo.");
        }
      } else {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        await sub?.unsubscribe();
        await setNotificationsEnabled(false);
        setEnabled(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">Notificaciones push</h3>
          <p className="text-xs text-zinc-500">
            Avisos al celular cuando se detecta un movimiento nuevo.
          </p>
        </div>
        <motion.button
          onClick={toggle}
          disabled={pending || !supported}
          aria-label="Notificaciones push"
          whileTap={reduce ? undefined : { scale: 0.92 }}
          transition={tap}
          animate={{ backgroundColor: enabled ? "#34d399" : "#3f3f46" }}
          className="relative h-7 w-12 shrink-0 rounded-full disabled:opacity-40 cursor-pointer"
        >
          <motion.span
            animate={{ x: enabled ? 24 : 4 }}
            transition={knobSpring}
            className="absolute top-1 h-5 w-5 rounded-full bg-zinc-950"
          />
        </motion.button>
      </div>
      {!supported && (
        <p className="text-xs text-zinc-600">
          Tu navegador no soporta notificaciones push.
        </p>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
