import { Compass, Home, Search } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { useI18n } from "@/i18n";

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Compass size={26} />
      </span>
      <p className="mt-8 font-mono text-[13px] tracking-[0.2em] text-fg-faint uppercase">{t("notFound.code")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
        {t("notFound.body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/shop" size="lg">
          <Search size={17} />
          {t("notFound.browse")}
        </ButtonLink>
        <ButtonLink to="/" size="lg" variant="outline">
          <Home size={17} />
          {t("notFound.home")}
        </ButtonLink>
      </div>
    </div>
  );
}
