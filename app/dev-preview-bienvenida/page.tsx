import { WelcomeOnboarding } from "@/components/onboarding/WelcomeOnboarding";

// Ruta temporal solo para revisar el diseño de /bienvenida sin tocar una
// cuenta real. Se borra apenas termine la revisión.
export default function DevPreviewBienvenida() {
  return (
    <WelcomeOnboarding userId="preview" initialFullName="" initialAvatarUrl={null} />
  );
}
