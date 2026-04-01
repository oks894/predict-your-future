import { isExpired } from "@/lib/storage";
import StarField from "./StarField";

const ExpiryGate = () => {
  if (!isExpired()) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mystical">
      <StarField />
      <div className="relative z-10 text-center p-8">
        <p className="text-6xl mb-6">😈</p>
        <h1 className="font-heading text-3xl md:text-5xl text-primary glow-gold mb-4">
          The portal has closed.
        </h1>
        <p className="text-xl text-muted-foreground">April Fools</p>
      </div>
    </div>
  );
};

export default ExpiryGate;
