
import React from "react";
import GlossaryViewer from "@/components/glossary/GlossaryViewer";
import { User } from "@/api/entities";
import GlossaryManager from "@/components/glossary/GlossaryManager";

export default function Glossary() {
  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const user = await User.me().catch(() => null);
      setMe(user);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-4 lg:p-8" dir="rtl">
      <GlossaryViewer />
      {me?.role === "admin" && (
        <div className="mt-6">
          <GlossaryManager />
        </div>
      )}
    </div>
  );
}
